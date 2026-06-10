from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from vehicle_scheduling.scheduler import VehicleScheduler


def test_scheduler_selects_optimal_subset(tmp_path):
    scheduler = VehicleScheduler(output_dir=tmp_path)
    depots = [{"ID": 1, "MechanicHours": 10}]
    vehicles = [{"TaskID": "t1", "Duration": 4, "Impact": 10}, {"TaskID": "t2", "Duration": 6, "Impact": 20}, {"TaskID": "t3", "Duration": 3, "Impact": 15}]

    results = scheduler.solve(depots=depots, vehicles=vehicles)

    assert len(results) == 1
    assert results[0]["depot_id"] == 1
    assert results[0]["total_duration"] == 9
    assert results[0]["total_impact"] == 35
    assert results[0]["selected_tasks"] == ["t2", "t3"]
    assert (tmp_path / "vehicle_schedule_results.json").exists()
