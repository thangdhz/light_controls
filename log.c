#include "appconfig.h"
#include "xqueue.h"
#include "log.h"

#define LOG_OUTPUT(...)                            printf(__VA_ARGS__)
#define MAX_LOG_QUEUE_SIZE                         8

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
            index = snprintf(log_line, sizeof(log_line), "[%c] [%s:%d] ", levelstr, file, line);        
        }                                                                                                                        
    } 

    va_start(args, format);
    index += vsprintf(&log_line[index], format, args);
    va_end(args);

    LOG_OUTPUT(log_line);
    LOG_OUTPUT("\r\n");

    xqueue_put(llog_queue, (uint8_t *)log_line, index);
}