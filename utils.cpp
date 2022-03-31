#include "nvs_flash.h"
#include "nvs.h"
#include "FS.h"
#include "SPIFFS.h"
#include "appconfig.h"
#include "log.h"
#include "utils.h"

#define FILE_PATH_RECORD                          "/record.txt"
#define RECORD_CH_SIZE                            2
static const char *record_file = FILE_PATH_RECORD;
static int recordch[RECORD_CH_SIZE];

void ls_l() {
    if (!SPIFFS.begin(true)) {
        LOG_ERR("An Error has occurred while mounting SPIFFS");
        return;
    }
  
    int count = 0;
    File root = SPIFFS.open("/");
    File file = root.openNextFile();
    while (file) {
        count++;
        LOG_DBG("%02d. File: %s", count, file.name());
        file = root.openNextFile();
    }

    if (!count) {
        LOG_INFO("Spiffs no file found!!");
    }
}


void record_init() {
    char line[32];
    int numb_lines = 0;

    memset(line, 0, sizeof(line));
    if (!SPIFFS.begin(true)) {
        LOG_ERR("An Error has occurred while mounting SPIFFS");
        return;
    }

    File file = SPIFFS.open(record_file);
    if (!file) {
        LOG_ERR("Failed to open record file for reading");
        return;
    }

    while (file.available()) {
        memset(line, 0, sizeof(line));
        file.readBytesUntil('\n', line, sizeof(line));
        numb_lines++;
    }

    file.close();

    String strs;
    String data = String(line);
    int count = 0;

    while (data.length() > 0 && count < RECORD_CH_SIZE) {
        int index = data.indexOf(' ');
        if (index == -1) {
            recordch[count++] = atoi(data.c_str());
            break;
        }
        else {
            strs = data.substring(0, index);
            recordch[count++] = atoi(strs.c_str());
            data = data.substring(index + 1);
        }
    }

    LOG_INFO(">>> swdimmer level %s >>> %d %d", line, recordch[0], recordch[1]);
    if (numb_lines < 1024) {
        return;
    }
    
    if (!SPIFFS.remove(record_file)) {
        LOG_ERR("Failed to delete all record");
    }

    record_set(recordch);
}

void record_get(int *ch) {
    memcpy(ch, recordch, RECORD_CH_SIZE * sizeof(int));
}

void record_set(int *ch) {
    char line[32];

    memset(line, 0, sizeof(line));
    memcpy(recordch, ch, RECORD_CH_SIZE * sizeof(int));
    File file = SPIFFS.open(record_file, FILE_APPEND);
    if (!file || file.isDirectory()) {
        LOG_ERR("Failed to open file for writing %s", record_file);
    }

    sprintf(line, "%d %d\n", ch[0], ch[1]);
    if (!file.print(line)){
        LOG_ERR("Failed to append record");
    }

    file.close();
}