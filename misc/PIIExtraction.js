const fs = require("fs");
let text = "";
//This filters everything that I think is pii
const listToFilter = [
  "age",
  "patientName",
  "dateOfBirth",
  "orderingPhysicianFacilityName",
  "orderingPhysicianName",
  "pathologistName",
  "orderingPhysicianClient",
];

function recurse(directory) {
  fs.readdir(directory, (err, files) => {
    files.forEach(function (file) {
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          recurse(directory + "/" + file);
          console.log("folder: " + file);
        } else {
          if (file.indexOf("xml_report.txt") != -1) {
            fs.readFile(directory + "/" + file, "utf-8", (err, data) => {
              if (err) throw err;
              text = data;
              for (let i = 0; i < listToFilter.length; i++) {
                var tag = listToFilter[i];
                var startIndex = text.indexOf("<" + tag + ">");
                var endIndex = text.indexOf("</" + tag + ">");
                text = text.substring(0, startIndex + tag.length + 2) + text.substring(endIndex);
              }
              fs.writeFileSync(directory + "/" + file, text);
              console.log(file);
            });
          }
        }
      });
    });
  });
}
recurse(".");

// Instructions

// Install Node
// You need to have Node.js installed on your computer in order to run this tool. , if not, go to https://nodejs.org/en/download/ to Install node by selecting the corresponding OS installation.
// Run Script
//          Place the script (attached above) to the ClassifierReports folder
//          In your ClassifierReports folder , run the script using the following command
// node PIIExtraction.js

// Note:
// 1.       This tool will loop through all the sample folders under ClassifierReports folders to update the QCI reports with this “id_xml_report.txt” naming convention.
// 2.       Currently the following fields will be removed.  Let us know if this list should be changed.
// ["age", "sex", "patientName","dateOfBirth", "diagnosis", "accession", "specimenId", "orderingPhysicianFacilityName", "orderingPhysicianName", "pathologistName", "orderingPhysicianClient", "specimenTumorContent","clinicalFinding", "primaryTumorSite"]
