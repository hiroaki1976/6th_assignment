//
// Firebase設定
//

// Import the functions you need from the SDKs you need
    import { initializeApp } 
        from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved, update, onChildChanged }
        from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Your web app's Firebase configuration
    import {firebaseConfig} from "../setting/firebase_api.js" // APIを外部からimportする

// Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app); // RealtimeDBに接続
    const dbRef = ref(db, 'book/');// RealtimeDB内の"book"を使う

//
// dataだけグローバル変数にする（複数の関数で使用するため）
//
let data;

//
// Google books APIでデータを取得する関数
//
$("#search").on('click', async() => {
    const textValue = $("#formText")[0].value;// フォームに入力されたテキストの取得
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${textValue}`);// Google Books APIのエンドポイントにフォームから取得したテキストを埋め込む
    data = await res.json();// 取得したjsonを配列データに変換する
    const bookItem = $("#bookItem")[0];// Id"bookItem"を取得し、定数bookItemへ代入する
    for(let i = 0; i < data.items.length; i++){
        try{// 例外が起きなければtryブロック内のコードが実行される
            const bookImg = data.items[i].volumeInfo.imageLinks.smallThumbnail;// 画像を表示するリンク
            const bookTitle = data.items[i].volumeInfo.title;// 本のタイトル
            const bookAuthors = data.items[i].volumeInfo.authors[0];// 本の著者
            const bookContent = data.items[i].volumeInfo.description;// 本の説明文
            const bookLink = data.items[i].volumeInfo.infoLink;// 各書籍のGoogle Booksへのリンク
            const makeElement = document.createElement("div");// 取得したデータを入れるための要素を作成
            makeElement.setAttribute("id", `bookItem${i}`);// 要素別に識別できるようにidに数字を埋め込む
            bookItem.appendChild(makeElement);// 取得した要素に作成した要素を挿入
            const getBookItem = $(`#bookItem${i}`)[0];// 作成した要素を定数getBookItemへ代入する
            // APIで取得したデータの分だけHTML要素を作成し、取得した要素を埋め込む
            const setBookElement = `
                <div class="container">
                    <div class="conOuter">
                        <div class="con-inner">
                            <div class="book-img">
                                <img src="${bookImg}"><br>
                                <a id="link${i}" target="_blank">${bookTitle}</a>
                                <p>${bookAuthors}</p>
                            </div>
                            <div class="book-content">
                                <p>${bookContent}</p>
                            </div>
                        </div>
                        <button class="registration">登録する</button>
                    </div>
                </div>
            `;
            getBookItem.innerHTML = setBookElement;// getBookItemの内容をsetBookElementへ書き換える
            const link = $(`#link${i}`)[0];// id="link[*]"の内容を取得し、定数linkへ代入する
            link.href = bookLink;// 定数bookLinkを定数linkのhrefへ代入する
        }catch(e){// 途中で例外が発生した場合はcatchブロック内のコードが実行される
            continue;
        };
    };
});

//
// 検索されたデータを登録する
//
$('#bookItem').on('click', '.registration', function () {
    const container = $(this).closest('.container');// .containerの中のクリックされた登録ボタンの所の要素を定数containerへ代入する
    const bookImg = container.find('img').attr('src');// 定数containerの中から書籍画像のリンクを取得し、定数bookImgへ代入する
    const bookTitle = container.find('a').text();// 定数containerの中から書籍タイトルの文字列を取得し、定数bookTitleへ代入する
    // const bookAuthors =container.find('p').text();// 定数containerの中から書籍著者の文字列を取得し、定数bookAuthorsへ代入する
    const bookLink = container.find('a').attr('href');// 定数containerの中からGoogle Booksへのリンクを取得し、定数bookLinkへ代入する

    const obj = {// 登録データを作成
        img: bookImg,
        title: bookTitle,
        // authors: bookAuthors,
        link: bookLink
    };

    const newPostRef = push(dbRef);// Firebaseにデータを登録
    set(newPostRef, obj);// Firebaseにデータを登録
});

//
// 最初にデータ取得＆リアルタイムにデータを取得
//
onChildAdded(dbRef, function (data) {
    const obj = data.val();// オブジェクトデータを取得し、変数objに代入
    const key = data.key;// データのユニークキー（削除や更新に必須）
//表示用テキスト・HTMLを作成
    let html = `
    <div class="${key}">
        <div class="container">
            <img src="${obj.img}"><br>
            <a href="${obj.link}" target="_blank">${obj.title}</a><br>
            <!-- <p>${obj.authors}</p> -->
            <span class="remove" data-key="${key}">🗑</span>
        </div>
    </div>
    `;
$("#output").prepend(html); //#outputの最後に追加
});

//
// 個別の登録の削除
// 
$('#output').on('click', '.remove', function(){
    const key = $(this).attr('data-key');
    const removeItem = ref(db, 'book/'+'/'+key);
    remove(removeItem);// Firebaseデータ削除関数
});

onChildRemoved(dbRef, function(data) {
    $('.'+data.key).remove();// HTML上のデータを削除
});