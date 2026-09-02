import { fetchJSON, type Result } from "@a2zb/lib";

// Shape of the Statens vegvesen "kjøretøydata" response (only the bits we use).
type SvvResponse = {
  kjoretoydataListe?: {
    kjoretoyId?: { kjennemerke?: string };
    forstegangsregistrering?: { registrertForstegangNorgeDato?: string };
    godkjenning?: {
      tekniskGodkjenning?: {
        tekniskeData?: {
          generelt?: {
            merke?: { merke?: string }[];
            handelsbetegnelse?: string[];
          };
          karosseriOgLasteplan?: {
            rFarge?: { kodeNavn?: string }[];
          };
        };
      };
    };
  }[];
};

// Fields SVV gives us to enrich a vehicle (plateNumber is the caller's input).
export type VehicleLookupFields = {
  make?: string;
  model?: string;
  color?: string;
  firstRegistered?: string;
};

const BASE_URL =
  "https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata";

// Look up a plate at Vegvesenet and map the response to our vehicle fields.
export async function lookupVehicle(
  plateNumber: string,
): Promise<Result<VehicleLookupFields>> {
  const API_KEY = process.env.VEGVESEN_API_KEY;
  if (!API_KEY) throw new Error("Missing VEGVESEN_API_KEY");

  const headers = new Headers({ "SVV-Authorization": `Apikey ${API_KEY}` });

  const result = await fetchJSON<SvvResponse>(
    `${BASE_URL}?kjennemerke=${encodeURIComponent(plateNumber)}`,
    { headers },
  );

  if (!result.ok) return result; // pass the fetchJSON error through

  const v = result.data.kjoretoydataListe?.[0];
  const teknisk = v?.godkjenning?.tekniskGodkjenning?.tekniskeData;

  return {
    ok: true,
    data: {
      make: teknisk?.generelt?.merke?.[0]?.merke,
      model: teknisk?.generelt?.handelsbetegnelse?.[0],
      color: teknisk?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn,
      firstRegistered: v?.forstegangsregistrering?.registrertForstegangNorgeDato
        ? v.forstegangsregistrering.registrertForstegangNorgeDato
        : undefined,
    },
  };
}
