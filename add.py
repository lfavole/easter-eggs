import json
import hashlib
from math import ceil
from pathlib import Path

def triangular_numbers_count(max):
    return ceil((-1 + (1 + 8 * max) ** 0.5) / 2)

def triangular_numbers(max):
    return [(x * x + x) // 2 for x in range(1, triangular_numbers_count(max) + 1) if x < max]

def two_way_obfuscate(length):
    ret = []
    index = 0
    max_passes = triangular_numbers_count(length + 1)
    for step_num in range(max_passes + 1):
        iter = triangular_numbers(length + 1)
        reverse = step_num % 2 == 0
        to_skip = step_num
        iterated = 0
        def op(n):
            nonlocal iterated, to_skip, index
            if reverse:
                if iterated + to_skip >= max_passes:
                    return
                iterated += 1
            elif to_skip > 0:
                to_skip -= 1
                return
            n = n - step_num - 1
            if n < length:
                ret.append((n, index))
                index += 1
        if reverse:
            for n in reversed(iter):
                op(n)
        else:
            for n in iter:
                op(n)
    return ret

def obfuscate(data):
    ret = [None] * len(data)
    for orig_pos, obfuscated_pos in two_way_obfuscate(len(data)):
        ret[obfuscated_pos] = data[orig_pos]
    return ret

def deobfuscate(data):
    ret = [None] * len(data)
    for orig_pos, obfuscated_pos in two_way_obfuscate(len(data)):
        ret[orig_pos] = data[obfuscated_pos]
    return ret

def main():
    keyword = input("Enter the keyword: ")
    file_path = input("Enter the path to the file: ")

    with open(file_path, 'rb') as file:
        data = file.read()

    obfuscated_data = obfuscate(data)

    keyword_hash = hashlib.sha1(keyword.encode()).hexdigest()

    base_path = Path(__file__).parent / "data" / keyword_hash[0]
    base_path.mkdir(parents=True, exist_ok=True)
    output_path = base_path / f"{keyword_hash}.bin"

    with open(output_path, 'wb') as file:
        file.write(bytes(obfuscated_data))

    metadata = {
        'path': output_path.name,
    }

    metadata_path = base_path / f"{keyword_hash}.json"
    with open(metadata_path, 'w', encoding='utf-8') as file:
        json.dump(metadata, file, separators=(",", ":"))

    print(f"Obfuscated file created at: {output_path}")
    print(f"Metadata file created at: {metadata_path}")

if __name__ == "__main__":
    main()
