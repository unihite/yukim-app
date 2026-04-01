import { Jimp } from "jimp";

async function processIcon() {
    try {
        console.log("이미지 로딩 중: yukim icon.png ...");
        const image = await Jimp.read("yukim icon.png");

        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        console.log("흰색 배경 투명화 처리 중...");
        // 픽셀 단위로 스캔하여 흰색(240 이상)을 투명으로 변경
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (width * y + x) << 2; 
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];
                if (r > 240 && g > 240 && b > 240) {
                    image.bitmap.data[idx + 3] = 0; // Alpha를 0(투명)으로 설정
                }
            }
        }

        console.log("투명 여백 잘라내기(꽉 찬 로고 만들기)...");
        // Jimp의 내장 autocrop 사용하여 투명해진 외곽 흰색 여백 제거
        image.autocrop();

        console.log("아이콘 크기별 리사이징 및 저장...");
        // 512x512
        const img512 = image.clone();
        img512.resize({ w: 512, h: 512 });
        await img512.write("public/icon-512x512.png");

        // 192x192
        const img192 = image.clone();
        img192.resize({ w: 192, h: 192 });
        await img192.write("public/icon-192x192.png");

        // Apple Icon 180x180
        const img180 = image.clone();
        img180.resize({ w: 180, h: 180 });
        await img180.write("public/apple-icon.png");

        console.log("성공! 투명하고 꽉 찬 아이콘이 public/ 폴더에 저장되었습니다.");
    } catch (err) {
        console.error("에러 발생:", err);
    }
}

processIcon();
