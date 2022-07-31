#include "appconfig.h"
#include "xqueue.h"
#include "time_sync.h"
#include "log.h"

#define LOG_OUTPUT(...)                            printf(__VA_ARGS__)
#define MAX_LOG_QUEUE_SIZE                         8
#define LOC_SIZE                                   24
void *llog_queue = NULL;

void llog_init()
{
    llog_queue = xqueue_init(MAX_LOG_QUEUE_SIZE);
}

void llog(uint8_t newline, uint8_t level, char levelstr, const char *file, uint32_t line, const char *format, ...)
{
    static char log_line[LOG_LINE_MAX];
    int index = 0;
    va_list args;

    if (level <= (LOG_LEVEL)) {                                
        if (newline) {
            char loc_str[LOC_SIZE];                            
            int loc_sz;                                        
            loc_sz = snprintf(loc_str, sizeof(loc_str), "%s:%d", file, line); 
            for (int i = loc_sz; i < LOC_SIZE - 1; i++) {      
                loc_str[i] = ' ';                             
            }                                                  
            loc_str[LOC_SIZE - 1] = '\0';                                              
            index = snprintf(log_line, sizeof(log_line), "[%c] [%s] [%s] ", levelstr, get_str_time(), loc_str);        
        }                                                                                                                        
    } 

    va_start(args, format);
    index += vsprintf(&log_line[index], format, args);
    va_end(args);

    LOG_OUTPUT(log_line);
    LOG_OUTPUT("\r\n");

    xqueue_put(llog_queue, (uint8_t *)log_line, index);
}