

list_convert = [
    { "file_path": "index.html", "arr_name": "PAGE_INDEX" },
    { "file_path": "script.js", "arr_name": "PAGE_SCRIPT" },
    { "file_path": "logs.html", "arr_name": "PAGE_LOGS" },
]

def file_to_arr_byte(file_path):
    arr_str = "{\n    "
    arr_size = 0
    try:
        f = open(file_path, 'rb')
        while True:
            arr_content = f.read(-1)  
            if not arr_content:
                break
            
            for b in arr_content:
                bstr = "0x%02x, " % b
                arr_str += bstr
                arr_size += 1
                if arr_size % 16 == 0:
                    arr_str += "\n    "

    except IOError:
        print('Error While Opening the file!')

    arr_str += "0x00, "
    arr_size += 1
    if arr_size % 16 == 0:
        arr_str += "\n    "

    arr_last = arr_str[-2]
    if "," in arr_last:
        arr_str = arr_str[:-2]
    else:
        arr_str = arr_str[:-8]
    arr_str += "\n};"
    return arr_str


webpage_cpp = """
#include "webpage.h"

"""

webpage_h = """
#ifndef __WEBPAGE_H
#define __WEBPAGE_H

"""

for item in list_convert:
    file_path = item["file_path"]
    arr_name = item["arr_name"]
    print("Convert file %s to array %s" % (file_path, arr_name))
    arr_data = file_to_arr_byte(file_path)
    webpage_h += "\nextern const char %s[];\n" % (arr_name)
    webpage_cpp += "\nconst char %s[] = %s\n" % (arr_name, arr_data)

webpage_h += """

#endif /* __WEBPAGE_H */
"""

with open("../webpage.cpp", 'w') as f:
    f.write("%s" % webpage_cpp)

with open("../webpage.h", 'w') as f:
    f.write("%s" % webpage_h)

