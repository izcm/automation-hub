# Hubben – Videomanus

**Formål:** Demonstrere de fire tjenestene til SWH Studio gjennom Hubben.

**Format:** Skjermopptak med korte tekstforklaringer og overganger mellom kapitlene.

**Estimert lengde:** 90–120 sekunder (kan justeres etter opptak).

---

## 1. Integrasjoner

### Introduksjon

_Vis en tekstskjerm med fire datakilder._

**Tekst på skjermen:**

Hubben samler informasjon fra fire ulike datakilder:

- **PowerOffice** – ansatte
- **Statens vegvesen** – kjøretøyinformasjon og EU-kontrollfrister
- **Excel** – kontrakter og kundeoppdrag
- **E-post** – kontrollresultater fra verkstedet

_Vis gjerne små ikoner ved hver datakilde._

_Vis deretter teksten:_

«Informasjonen behandles og lagres i en felles database.»

_Bruk en kort overgang fra datakildene til selve applikasjonen._

**Ikke nødvendig å vise:** Databasetabeller, rådata eller individuelle API-kall.

---

## 2. Visualisering

### Del A – Utforsk dashboardet

_Vis Hubben idet vi lander på dashboardet._

**Tekst:**

«Hubben gir en interaktiv oversikt over kjøretøyenes EU-kontroller.»

_La dashboardet være synlig noen sekunder._

_Vis KPI-ene og grafene._

_Endre ett eller to filtre._

_Vis at KPI-er og grafer oppdateres._

_Trykk på «Drill down» for å åpne listevisningen._

**Tekst:**

«Filtrene fra dashboardet følger med til listevisningen.»

_Vis de aktive filtrene._

_Åpne én oppføring i sidepanelet._

**Tekst:**

«Her kan vi også undersøke hver enkelt oppføring.»

_Lukk sidepanelet._

### Del B – Et konkret eksempel

_Gå tilbake til dashboardet._

_Vis en kort tekstskjerm._

**Tekst:**

«Sindre er ikke tilgjengelig de neste fire ukene. Vi må finne kjøretøyene han har ansvar for.»

_Filtrer på ansvarlig ansatt: Sindre._

_Velg perioden: de neste fire ukene._

_Velg alle kontrollstatuser unntatt «Approved»._

_Vis hvordan KPI-er og grafer oppdateres._

_La resultatet stå synlig et øyeblikk._

_Trykk på «Drill down»._

**Tekst:**

«Disse oppføringene trenger oppfølging.»

_Gå direkte videre til neste kapittel uten å forlate listevisningen._

---

## 3. Interaktive verktøy

### Del A – Omfordel ansvar

_Vi fortsetter i listevisningen fra forrige kapittel._

**Tekst:**

«Hubben har også verktøy som lar oss gjøre endringer direkte i oversikten.»

_Trykk på «Select all»._

_Vis at alle aktuelle rader blir valgt._

_Åpne menyen for massehandlinger._

_Velg «Assign employee»._

**Tekst:**

«Mari er tilgjengelig i perioden og overtar ansvaret.»

_Velg Mari som ny ansvarlig._

_Bekreft endringen._

_Vis at oppføringene oppdateres._

_La suksessmeldingen være synlig et øyeblikk._

### Del B – Oppdater filtrerte resultater

_Vis at oppføringene fortsatt ligger i listen, men nå har Mari som ansvarlig._

_Fremhev meldingen «Results no longer match filters»._

**Tekst:**

«Oppføringene er oppdatert, men samsvarer ikke lenger med filtrene.»

_Trykk på knappen for å bruke filtrene på nytt._

_Vis at listevisningen blir tom._

**Tekst:**

«Ingen oppføringer samsvarer lenger med filtrene.»

_Gå tilbake til dashboardet._

_Vis at KPI-ene nå viser 0 for det aktive utvalget._

_Fjern filtrene._

_Filtrer på Mari._

_Vis at de aktuelle oppføringene nå er knyttet til henne._

**Tekst:**

«Mari har overtatt ansvaret.»

### Del C – Varsling

_Vis en kort bekreftelse eller en e-post til Mari._

**Tekst:**

«Ved endringer kan den nye ansvarlige varsles automatisk på e-post.»

_Fade ut._

---

## 4. Automatisering

### Del A – Kontrollresultater fra verksted

_Vis kapitteltittelen «Automatisering»._

**Tekst:**

«Verkstedet sender resultatene fra EU-kontroller på e-post.»

_Vis et eksempel på en innkommende e-post._

**Eksempel:**

Fra: Verksted

Emne: EU-kontroll – AB12345

Registreringsnummer: AB12345

Resultat: Godkjent

Kontrolldato: 15.01.2027

_Fremhev registreringsnummeret og kontrollresultatet._

**Tekst:**

«En bakgrunnsprosess kan lese nye e-poster og hente ut kontrollresultatene.»

_Vis en kort overgang fra e-posten til den aktuelle oppføringen i Hubben._

_Vis at kontrollstatusen endres til «Approved»._

**Tekst:**

«Oppføringen oppdateres automatisk, uten manuell registrering.»

### Del B – Automatisering av ansvarsfordeling

_Vis en kort tekstskjerm som viser tilbake til eksempelet med Sindre._

**Tekst:**

«Tidligere omfordelte vi ansvaret fra Sindre til Mari manuelt.»

_Vis gjerne et kort klipp fra massehandlingen._

**Tekst:**

«Men dersom fraværet registreres i PowerOffice, kan også denne prosessen automatiseres.»

_Vis en enkel sekvens:_

1. _Fravær registreres i PowerOffice._
2. _Hubben identifiserer berørte oppføringer._
3. _Systemet foreslår nye ansvarlige._
4. _En leder godkjenner endringene._
5. _De nye ansvarlige varsles automatisk._

**Avsluttende tekst:**

«Fra innhenting av data til oversikt, handling og automatisering.»

---

## 5. Avslutning

_Vis Hubben-dashboardet i noen sekunder._

_Fade over til SWH Studio._

**Tekst:**

**SWH Studio**

Skreddersydd programvare for din bedrift.

_Avslutt med logoen og eventuelt swh.no._

---

## Opptak og redigering – huskeliste

- [ ] Vis bare noen få sekunder av dashboardet før første interaksjon.
- [ ] Bruk korte tekstforklaringer, ikke lange avsnitt.
- [ ] Behold den samme Sindre/Mari-historien gjennom visualisering og interaktive verktøy.
- [ ] Vis at filtrerte resultater ikke forsvinner før filtrene brukes på nytt.
- [ ] Vis resultatet av automatiseringen, ikke cron-konfigurasjon eller Docker-infrastruktur.
- [ ] Unngå unødvendige overganger midt i en sammenhengende oppgave.
- [ ] Bruk samme typografi og visuelle stil som SWH Studio-nettsiden.
- [ ] Klipp bort unødvendig venting mellom handlingene.
