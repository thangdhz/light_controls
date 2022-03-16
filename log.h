#ifndef __LOG_H
#define __LOG_H

#include <stdio.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

#define LLOG_LEVEL_NONE                            0 /*< No log */
#define LLOG_LEVEL_ERR                             1 /*< Errors */
#define LLOG_LEVEL_WARN                            2 /*< Warnings */
#define LLOG_LEVEL_INFO                            3 /*< Basic info */
#define LLOG_LEVEL_DBG                             4 /*< Detailled debug */

#define LOG_WITH_LOC                               1
#define LOG_OUTPUT(...)                            printf(__VA_ARGS__)
#define __FILE_NAME__                              (strrchr(__FILE__, '\\') ? strrchr(__FILE__, '\\') + 1 : __FILE__)

#define LOG(newline, level, levelstr, ...)                         \
    do {                                                           \
        if (level <= (LOG_LEVEL)) {                                \
            if (newline) {                                         \
                char loc_str[64];                                  \
                snprintf(loc_str, sizeof(loc_str), "%s:%d", __FILE_NAME__, __LINE__); \
                LOG_OUTPUT("[%s][%s] ", levelstr, loc_str);        \
            }                                                      \
            LOG_OUTPUT(__VA_ARGS__);                               \
            LOG_OUTPUT("\r\n");                                    \
        }                                                          \
    } while (0)

#define LOG_PRINT(...)                             LOG(1, 0, "P", __VA_ARGS__)
#define LOG_ERR(...)                               LOG(1, LLOG_LEVEL_ERR, "E", __VA_ARGS__)
#define LOG_WARN(...)                              LOG(1, LLOG_LEVEL_WARN, "W", __VA_ARGS__)
#define LOG_INFO(...)                              LOG(1, LLOG_LEVEL_INFO, "I", __VA_ARGS__)
#define LOG_DBG(...)                               LOG(1, LLOG_LEVEL_DBG, "D", __VA_ARGS__)


#ifdef __cplusplus
}
#endif

#endif /* __LOG_H */
