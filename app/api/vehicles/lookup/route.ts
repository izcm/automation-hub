import { fetchJSON } from "@a2zb/lib";

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

const BASE_URL =
  "https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata";

export async function GET(request: Request) {
  const API_KEY = process.env.VEGVESEN_API_KEY;
  if (!API_KEY) throw new Error("Missing VEGVESEN_API_KEY");

  const plateNumber = new URL(request.url).searchParams.get("plateNumber");
  if (!plateNumber) {
    return Response.json({ error: "Missing 'plateNumber'" }, { status: 400 });
  }

  const headers = new Headers({ "SVV-Authorization": `Apikey ${API_KEY}` });

  const result = await fetchJSON<SvvResponse>(
    `${BASE_URL}?kjennemerke=${encodeURIComponent(plateNumber)}`,
    { headers },
  );

  if (!result.ok)
    return Response.json({ error: result.error }, { status: 502 });

  const v = result.data.kjoretoydataListe?.[0];
  const teknisk = v?.godkjenning?.tekniskGodkjenning?.tekniskeData;

  const vehicle = {
    reg: v?.kjoretoyId?.kjennemerke,
    make: teknisk?.generelt?.merke?.[0]?.merke,
    model: teknisk?.generelt?.handelsbetegnelse?.[0],
    color: teknisk?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn,
    firstRegistered: v?.forstegangsregistrering?.registrertForstegangNorgeDato,
  };

  return Response.json(vehicle);
}
