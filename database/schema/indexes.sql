create index "index_annotation_query" on "annotation"(
    "order",
    "sample",
    "idatFile",
    "organSystem",
    "embedding",
    "class",
    "label",
    "x",
    "y",
    "study",
    "institution",
    "category",
    "matched"
);