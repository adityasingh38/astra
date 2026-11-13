from uuid import uuid4

from fastapi.testclient import TestClient

from app import main
from app.auth import current_user
from app.models import BirthProfile
from app.storage import profile_to_row


def test_profile_chart_transit_comparison_and_export(monkeypatch):
    first_id, second_id = uuid4(), uuid4()
    def row(name, id):
        profile = BirthProfile(name=name, birth_date="2002-06-21", birth_time="20:20", timezone="Asia/Kolkata", latitude=9.9312, longitude=76.2673, place_label="Kochi")
        return {"id": str(id), **profile_to_row(profile)}
    rows = {first_id: row("First", first_id), second_id: row("Second", second_id)}
    saved = []

    class FakeStore:
        def __init__(self, token):
            assert token == "demo"
        async def get(self, id):
            return rows[id]
        async def save_chart(self, id, chart):
            saved.append((id, chart["western"]["positions"]["Sun"]["longitude"]))
        async def export(self):
            return {"birth_profiles": list(rows.values()), "chart_snapshots": []}

    monkeypatch.setattr(main, "ProfileStore", FakeStore)
    main.app.dependency_overrides[current_user] = lambda: "test-user"
    try:
        client = TestClient(main.app)
        headers = {"Authorization": "Bearer demo"}
        chart = client.get(f"/birth-profiles/{first_id}/chart", headers=headers)
        assert chart.status_code == 200
        assert len(saved) == 1
        assert chart.json()["vedic"]["moon_nakshatra"]["name"]
        transit = client.get(f"/birth-profiles/{first_id}/transits?day=2026-11-13", headers=headers)
        assert transit.status_code == 200
        assert transit.json()["date_local"] == "2026-11-13"
        comparison = client.get(f"/birth-profiles/{first_id}/connections/{second_id}", headers=headers)
        assert comparison.status_code == 200
        assert comparison.json()["profiles"] == ["First", "Second"]
        export = client.get("/privacy/export", headers=headers)
        assert export.status_code == 200
        assert len(export.json()["birth_profiles"]) == 2
    finally:
        main.app.dependency_overrides.clear()
