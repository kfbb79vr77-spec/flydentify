import { KnotCarousel } from "@/components/KnotCarousel";
import { knots } from "@/lib/knotData";
import { useParams } from "wouter";

const ALL_KNOTS = [
  "improved_clinch", "palomar", "davy_knot", "blood_knot",
  "surgeons_knot", "dropper_loop", "non_slip_mono", "turle_knot", "trilene_knot"
];

export default function KnotProofPage() {
  const params = useParams<{ knotId?: string }>();
  const knotsToShow = params.knotId ? [params.knotId] : ALL_KNOTS;

  return (
    <div style={{ background: "#0D1B33", minHeight: "100vh", padding: "20px 20px 60px" }}>
      {knotsToShow.map((id) => {
        const knot = knots[id];
        if (!knot) return <div key={id} style={{ color: "red" }}>Knot not found: {id}</div>;
        return (
          <div key={id} style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2 style={{ color: "#A67A3A", fontFamily: "serif", marginBottom: 8, paddingTop: 10 }}>{knot.name}</h2>
            <KnotCarousel knotId={id} mode="fw" />
          </div>
        );
      })}
    </div>
  );
}
