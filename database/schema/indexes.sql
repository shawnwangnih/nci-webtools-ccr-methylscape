create index "index_annotation_query" on "annotation"(
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