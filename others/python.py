word = "aabcd"
def isUnique(word):
    for i in range(len(word)):
        for j in range(i + 1, len(word)):
            if word[i] == word[j]:
                return False
    return True
print(isUnique(word))