import React, { Suspense, useState, useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import { useRecoilState, useRecoilValue } from "recoil";
import parse from "html-react-parser";
import { qciData, QCIState } from "./qci.state";
import { useSearchParams } from "react-router-dom";
import { json2xml, xml2js } from "xml-js";

import Table from "../components/table";
import "./qci.css";

export default function Report() {
  const { snvTable, cnvTable, fusionTable, unkTable } = useRecoilValue(qciData);

  return (
    <div>
      {snvTable.data.length ||
      cnvTable.data.length ||
      fusionTable.data.length ||
      unkTable.data.length ? (
        <div>
          <div id="significantTables">
            <h2>VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h2>
            {snvTable.data.length ? (
              <div>
                <Table {...snvTable} size="small" />{" "}
                <sub>
                  *VAF: Variant Allele Frequency; **TIER: Actionability
                  Classification
                </sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable small nucleotide variants detected.
              </h3>
            )}
            {cnvTable.data.length ? (
              <div>
                <Table {...cnvTable} />
                <div>
                  <div>
                    <sub>**TIER: Actionability Classification</sub>
                  </div>
                  <div>
                    <sub>
                      CNV analysis is not performed when tumor content &lt;50%.
                    </sub>
                  </div>
                </div>
              </div>
            ) : (
              <h3 className="noDataTitle">No reportable CNVs.</h3>
            )}
            {fusionTable.data.length ? (
              <div>
                <Table {...fusionTable} />
                <sub>**TIER: Actionability Classification</sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable fusions or rearrangements.
              </h3>
            )}
          </div>
          <div id="uncertainSignificance">
            <h2>VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h2>
            {unkTable.data.length ? (
              <div>
                <Table {...unkTable} />
                <sub>*VAF: Variant Allele Frequency</sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable variants of uncertain significance
              </h3>
            )}
          </div>
        </div>
      ) : (
        <h2>No Report Available</h2>
      )}
    </div>
  );
}
