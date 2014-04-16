library(plyr)
## Crosslet
school_crosslet  <- read.csv("comi13.csv")
# school_crosslet <- ddply(comi13, .(school), summarise, 
#                          nstudents = length(score))
# write.csv(school_crosslet, "comi13.csv", row.names = FALSE)

latest_coords <- read.csv("schools_coords.csv", sep="\t")
school_crosslet <- merge(school_crosslet, latest_coords)#, all = TRUE)
# school_crosslet$name <- ifelse(school_crosslet$especialidad != '',
#                                str_c(school_crosslet$name, 
#                                      ' (', 
#                                      school_crosslet$especialidad, 
#                                      ' )'),
#                                as.character(school_crosslet$name))
#                                
school_crosslet <- school_crosslet[order(-school_crosslet$nstudents),]
write.csv(school_crosslet, "../data/schools.csv", row.names=FALSE)
