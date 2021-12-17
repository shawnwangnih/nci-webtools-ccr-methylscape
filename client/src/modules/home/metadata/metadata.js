import { Suspense } from "react";
import Alert from "react-bootstrap/Alert";
import Loader from "../../components/loader";
import ErrorBoundary from "../../components/error-boundary";
import MetadataForm from "./metadata-form";
import MetadataPlot from "./metadata-plot";

export default function Metadata({ className, onSelect }) {

  return (
    <div className={className}>
      <MetadataForm className="d-block" />
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the
            website administrator if this problem persists.
          </Alert>
        }>
        <Suspense fallback={<Loader message="Loading Plot" />}>
          <MetadataPlot onSelect={onSelect} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
