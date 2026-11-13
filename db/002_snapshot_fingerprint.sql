-- Apply after 001_initial.sql. Old rows have no fingerprint and remain exportable.
alter table chart_snapshots add column profile_fingerprint text;
create unique index chart_snapshots_version_fingerprint_idx
  on chart_snapshots(profile_id, system, calculation_version, profile_fingerprint);
