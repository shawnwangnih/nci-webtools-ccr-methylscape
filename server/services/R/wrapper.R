require(jsonlite)

# call functions given fn name and capture console output
wrapper <- function(fn, args, paths) {
  stdout <- vector('character')
  con <- textConnection('stdout', 'wr', local = TRUE)
  sink(con, type = "message")
  sink(con, type = "output")

  output = list()

  tryCatch({
    output = get(fn)(args, paths)
  }, error = function(e) {
    output <<- append(output, list(uncaughtError = paste0(deparse(e$call), ': ', e$message)))
  }, finally = {
    sink(con)
    sink(con)
    return(toJSON(list(stdout = stdout, output = output), pretty = TRUE, auto_unbox = TRUE))
  })
}

survival <- function(args, paths) {
  require(survival)
  require(survminer)

  # convert data to numeric
  args$os_months = as.numeric(unlist(args$os_months))
  args$os_status = as.numeric(unlist(args$os_status))

  fit = survfit(Surv(os_months, os_status) ~ 1, data = args)
  plot = ggsurvplot(fit, data = args,
    censor.size = 1, size = 1,
    conf.int = FALSE,
    conf.int.style = "ribbon",
    risk.table = TRUE,
    tables.height = 0.25,
    pval = TRUE,
    pval.size = 10,
    legend = "none",
    legend.title = "",
    xlab = "Overall survival (months)",
    palette = c("red", "blue", "green"),
    ggtheme = theme_bw(base_size = 20,
    base_family = "Arial"))

  file = paste0(paths$id, '/', 'survival_os.png')
  path = file.path(paths$save, file)
  print(path)
  ggsave(filename = path, plot = print(plot))
  return(list(path = file.path(paths$id, 'survival_os.png')))
}