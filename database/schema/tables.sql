create table annotation (
    "id" integer primary key,
    "order" integer,
    "sample" text,
    "idatFile" text,
    "organSystem" text,
    "embedding" text,
    "class" text,
    "label" text,
    "x" real,
    "y" real,
    "study" text,
    "institution" text,
    "category" text,
    "matched" text
);