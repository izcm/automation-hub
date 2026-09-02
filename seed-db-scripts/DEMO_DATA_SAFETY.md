### Demo registration numbers

Demo vehicles must not use known real registration numbers.

https://www.vegvesen.no/kjoretoy/eie-og-vedlikeholde/skilt/skiltserier/

For ordinary Norwegian registration numbers, Statens vegvesen defines the numeric series as:

- Cars and trucks: **10000–99999**
- Other vehicles: **1000–9999**

Demo data should therefore use **leading-zero numbers** (e.g. `ZZ 00000` or `ZZ 01234`) so they fall outside the ordinary registration-number series while retaining a realistic format.

**Important:** Personalised registration plates exist in Norway, so a leading-zero combination should not be treated as an absolute guarantee that the same character sequence has never been issued. Demo registration numbers must never be used to retrieve or associate data with a real vehicle or person – **§ 2a-2.Utforming og innhold**.

This demo's test data avoids pointing to any real registration number by prefixing the numeral part of the registration numbers with 0s.

### Demo VINs

A VIN is a unique identifier for a vehicle and, unlike a registration number, remains assigned to the vehicle throughout its lifetime.

A VIN consists of 17 characters. NHTSA specifies that each character must be either:

1. A letter in the set `[ABCDEFGHJKLMNPRSTUVWXYZ]`
2. A numeral in the set `[0123456789]`

The letters **I, O, and Q are therefore not permitted** in a VIN.

NHTSA — Vehicle Identification Number Requirements:
https://www.nhtsa.gov/sites/nhtsa.gov/files/vin_final_rule_april_08.pdf

This demo deliberately includes all three of the prohibited VIN character (`I`, `O`, or `Q`) in every generated demo VIN. The generated identifiers therefore cannot be valid VINs and cannot identify a real vehicle.
