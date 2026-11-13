# Calculation verification

ASTRA bundles the Astrodienst Swiss Ephemeris files `sepl_18.se1` and `semo_18.se1` for 1800–2399. Source: https://github.com/aloistr/swisseph/tree/master/ephe. The engine checks SHA-256 before its first calculation and requires `FLG_SWIEPH` in every planetary return flag. It rejects dates outside the bundled range. `SWEPH_EPHE_PATH` can point to a copy of the same files; hashes must match.

| File | SHA-256 |
| --- | --- |
| `sepl_18.se1` | `ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66` |
| `semo_18.se1` | `1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7` |

## Independent reference

The regression chart is Kochi, India, 21 June 2002 at 20:20 Asia/Kolkata, corresponding to 14:50 UTC. JPL Horizons observer ephemeris queries used `CENTER='500@399'` (geocentric), `EPHEM_TYPE='OBSERVER'`, `QUANTITIES='31'` (observer-centered ecliptic longitude/latitude of date), `TIME_TYPE='UT'`, `START_TIME='2002-06-21 14:50'`, `STOP_TIME='2002-06-21 14:51'`, and `STEP_SIZE='1 m'`. Commands were `10` (Sun), `301` (Moon), and `499` (Mars). Endpoint: https://ssd.jpl.nasa.gov/api/horizons.api; documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html.

| Body | JPL longitude | ASTRA longitude | Absolute difference |
| --- | ---: | ---: | ---: |
| Sun | 90.0566950° | 90.056711° | 0.000016° |
| Moon | 227.7886935° | 227.788741° | 0.000048° |
| Mars | 105.7776516° | 105.777667° | 0.000016° |

`services/api/tests/test_engine.py` asserts agreement within 0.001°. The reference validates three tropical planetary longitudes at one instant. It does not independently validate houses, sidereal ayanamsa, divisional charts, dashas, historical edge cases, or interpretation quality. Broader external reference charts remain a release gate.
