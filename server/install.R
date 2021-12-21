
Sys.setenv(
  "R_REMOTES_UPGRADE"="always",
  "R_REMOTES_NO_ERRORS_FROM_WARNINGS"=TRUE
)

install.packages(
  c(
    'jsonlite',
    'remotes'
  ), 
  repos='https://cloud.r-project.org/'
)