import { ReviewScreen } from "~/app/_components/review-screen";
import { demoReview } from "~/app/_components/demo-review";

export default function DemoReviewPage() {
  return <ReviewScreen review={demoReview} />;
}
