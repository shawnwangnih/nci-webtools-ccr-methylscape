import React, { Suspense, useState, useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import { useRecoilState } from "recoil";
import { QCIState } from "./qci.state";
import { useSearchParams } from "react-router-dom";

import Loader from "../components/loader";
import ErrorBoundary from "../components/error-boundary";

import "./qci.css";
import Report from "./report";

export default function QCI() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [state, setState] = useRecoilState(QCIState);
  const mergeState = (newState) => setState({ ...state, ...newState });

  // set params
  useEffect(() => {
    mergeState({ id: searchParams.get("id"), file: searchParams.get("file") });
  }, []);

  // render string as html
  function renderHTML(html) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div>
      <pre>
        <code>{JSON.stringify(state)}</code>
      </pre>
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the
            website administrator if this problem persists.
          </Alert>
        }>
        <Suspense fallback={<Loader message="Loading Table" />}>
          <Report />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
