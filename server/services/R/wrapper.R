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

getSurvivalData <- function(data) {
    survivalFormula <- survival::Surv(OS_months, OS_status) ~ group
    survivalCurves <- survminer::surv_fit(survivalFormula, data = data)
    survivalDataTable <- survminer::surv_summary(survivalCurves, data)
    
    survivalSummaryTimes <- survminer:::.get_default_breaks(survivalCurves$time)
    survivalSummary <- summary(survivalCurves, times = survivalSummaryTimes, extend = T)
    survivalSummaryTable <- data.frame(
        time = survivalSummary$time,
        n.risk = survivalSummary$n.risk,
        strata = survivalSummary$strata
    )
    
    pValue <- survminer::surv_pvalue(survivalCurves)
    
    list(
        data = survivalDataTable, 
        summary = survivalSummaryTable, 
        pValue = pValue
    )
}