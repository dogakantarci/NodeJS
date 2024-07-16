const fs = require('fs');
const path = require('path');

/**
 * Belirtilen dizin altında dosya arar ve dosyanın içeriğini ekrana bastırır.
 * @param {string} dir Başlangıç dizini.
 * @param {string} targetFile Aranacak dosya adı.
 */
function findFile(dir, targetFile) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        console.error(`Dizine erişilemedi: ${dir}`);
        return;
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (err) {
            console.error(`Dosya bilgisine erişilemedi: ${fullPath}`);
            continue;
        }

        if (stat.isDirectory()) {
            findFile(fullPath, targetFile);
        } else if (stat.isFile() && file === targetFile) {
            printFileContent(fullPath);
            return;
        }
    }
}

/**
 * Dosyanın içeriğini okur ve ekrana bastırır.
 * @param {string} filePath Dosya yolu.
 */
function printFileContent(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`Dosyanın içeriği (${filePath}):\n${content}`);
    } catch (err) {
        console.error(`Dosya okunamadı: ${filePath}`);
    }
}

// Kullanım
const targetFileName = 'example.txt'; // Aranacak dosya adını buraya girin
const startingDir = '/home/doa/Belgeler'; // Aramaya başlanacak dizin yolunu buraya girin

findFile(startingDir, targetFileName);
