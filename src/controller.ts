import NumberPlate = require("./number_plate")
import Setting = require("./setting")

import * as PDFMake from 'pdfmake/build/pdfmake'

// ナンバープレートModel
let numberPlate: NumberPlate;

// エントリポイント
window.onload = function () {
    // キャンパス要素を取得
    var canvas: HTMLCanvasElement = document.getElementById("plate-view") as HTMLCanvasElement;

    if (!canvas) {
        return;
    }

    numberPlate = new NumberPlate(canvas);

    numberPlate.init(load);
}

// 読み込み時処理
function load() {
    numberPlate.drawAll();

    // スケール一覧追加
    const INIT_SCALE_NUM = 24;
    const scaleInput = document.getElementById("scale") as HTMLSelectElement;
    for (let number = 10; number <= 90; number++) {
        // オプション生成
        const option = document.createElement('option');
        option.textContent = "1/" + number.toString();
        option.value = number.toString();

        // 初期選択
        if(INIT_SCALE_NUM == number){
            option.selected = true;
        }

        scaleInput.appendChild(option);
    }

    //===================================
    // イベント登録
    //===================================
    // ひらがな
    const hiraganaInput = document.getElementById("hiragana") as HTMLInputElement;
    hiraganaInput.oninput = changeHiragana;

    // 運輸支局
    const kanjiInput = document.getElementById("kanji") as HTMLInputElement;
    kanjiInput.oninput = changeKanji;

    // 普通自動車/軽自動車
    const normalCarInput = document.getElementById("normal-car") as HTMLInputElement;
    normalCarInput.onclick = changeCarType;
    const keiCarInput = document.getElementById("kei-car") as HTMLInputElement;
    keiCarInput.onclick = changeCarType;

    // 自家用車/社用車
    const homeUseInput = document.getElementById("home-use") as HTMLInputElement;
    homeUseInput.onclick = changeIsCompany;
    const companyUseInput = document.getElementById("company-use") as HTMLInputElement;
    companyUseInput.onclick = changeIsCompany;

    // 分類番号
    for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
        const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
        input.oninput = changeSmallNumber;
    }
    // 一連指定番号
    for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
        const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
        input.oninput = changeLargeNumber;
    }

    // pdf関連
    const printButton = document.getElementById("download-button") as HTMLButtonElement;
    printButton.onclick = savePDF;


    //ローディング画面非表示
    const loadingDiv = document.getElementById("loading") as HTMLDivElement;
    loadingDiv.classList.toggle('is-show')
}

//===================================
// Callback関数
//===================================
// ひらがな変更時callback関数
function changeHiragana() {
    const hiragana_input = document.getElementById("hiragana") as HTMLInputElement;

    const text: string = hiragana_input.value;

    numberPlate.setHiragana(text);
}

// 運輸支局変更時callback関数
function changeKanji() {
    const kanjiInput = document.getElementById("kanji") as HTMLInputElement;

    const text: string = kanjiInput.value;

    numberPlate.setKanji(text);
}

// 一連指定番号変更時callback関数
function changeLargeNumber() {
    const largeNumberList: string[] = [];

    for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
        const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
        largeNumberList.push(input.value);
    }

    numberPlate.setLargeNumber(largeNumberList);
}

// 分類番号変更時callback関数
function changeSmallNumber() {
    const smallNumberList: string[] = [];

    for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
        const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
        smallNumberList.push(input.value);
    }

    numberPlate.setSmallNumber(smallNumberList);
}

// 普通自動車/軽自動車変更時callback関数
function changeCarType() {
    const carTypeInput = document.getElementById("normal-car") as HTMLInputElement;

    if (carTypeInput.checked) {
        numberPlate.setCarType(NumberPlate.NORMAL_CAR);
    }
    else {
        numberPlate.setCarType(NumberPlate.KEI_CAR);
    }
}

// 自家用車/社用車変更時callback関数
function changeIsCompany() {
    const carTypeInput = document.getElementById("home-use") as HTMLInputElement;

    if (carTypeInput.checked) {
        numberPlate.setIsCompany(false);
    }
    else {
        numberPlate.setIsCompany(true);
    }
}


//===================================
// PdfMake関連
//===================================
// pdfを表示する
function savePDF() {
    const docDefinition = createDocDefinition();

    PDFMake.createPdf(docDefinition).open();
}

// pdfを印刷する
function printPDF() {
    const docDefinition = createDocDefinition();

    PDFMake.createPdf(docDefinition).print();
}
function createDocDefinition(): PDFMake.TDocumentDefinitions
{
    //===================================
    // 各種寸法作成
    //===================================
    // スケール取得
    const scaleInput = document.getElementById("scale") as HTMLSelectElement;
    const scale_text = scaleInput.value;

    // 描画するプレートのサイズを計算
    const scale = 1 / Number(scale_text);
    const plateWidth = Setting.mm2pt(Setting.PLATE_WIDTH_MM * scale);

    // 各種マージン
    const plateMargin = Setting.mm2pt(10);
    const pageMargin = Setting.mm2pt(20);

    // ナンバープレート画像取得
    const base64 = numberPlate.toDataURL();

    // pdf設定
    const docDefinition = {
        pageSize: "A4" as any,
        pageMargins: pageMargin,
        content: [
            {
                columns: [
                    {
                        image: base64,
                        width: plateWidth,
                    },
                    {
                        text: "",
                        width: plateMargin
                    },
                    {
                        image: base64,
                        width: plateWidth
                    },
                    {
                        text: "",
                        width: plateMargin
                    },
                    {
                        image: base64,
                        width: plateWidth,
                    },
                    {
                        text: "",
                        width: plateMargin
                    },
                    {
                        image: base64,
                        width: plateWidth,
                    }
                ]
            }
        ]
    };

    return docDefinition;
}