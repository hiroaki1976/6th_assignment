  // Import the functions you need from the SDKs you need
    import { initializeApp } 
        from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved, update, onChildChanged }
        from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  import {firebaseConfig} from "../setting/firebase_api.js"

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app); //RealtimeDBに接続
  const dbRef = ref(db, 'book/');


let bookImg;
let bookTitle;
let bookLink;
let data;

$("#search").on('click', async() => {
    // フォームに入力されたテキストの取得
    const textValue = $("#formText")[0].value;
    // 書籍検索ができるGoogle Books APIのエンドポイントにフォームから取得したテキストを埋め込む
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${textValue}`);
    data = await res.json();
    const bookItem = $("#bookItem")[0];
    for(let i = 0; i < data.items.length; i++){
        // 例外が起きなければtryブロック内のコードが実行される
        try{
            // JSONデータの取得
            // 画像を表示するリンク
            bookImg = data.items[i].volumeInfo.imageLinks.smallThumbnail;
            // 本のタイトル
            bookTitle = data.items[i].volumeInfo.title;
            // 本の説明文
            const bookContent = data.items[i].volumeInfo.description;
            // 各書籍のGoogle Booksへのリンク
            bookLink = data.items[i].volumeInfo.infoLink;
            // 取得したデータを入れるための要素を作成
            const makeElement = document.createElement("div");
            // 要素別に識別できるようにidに数字を埋め込む
            makeElement.setAttribute("id", `bookItem${i}`);
            // 取得した要素に作成した要素を挿入
            bookItem.appendChild(makeElement);
            // 作成した要素を習得
            const getBookItem = $(`#bookItem${i}`)[0];
            // APIで取得したデータの分だけHTML要素を作成し、取得した要素にを埋め込む
            const setBookElement = `
                <div class="container">
                    <div>
                        <div>
                            <div>
                                <img src="${bookImg}"><br>
                                <a id="link${i}" target="_blank">${bookTitle}</a>
                                <div>
                                    <p>${bookContent}</p>
                                </div>
                            </div>
                            <button class="registration">登録する</button>
                        </div>
                    </div>
                </div>
            `;
            // APIから取得した、実際のGoogle Booksのサイトに飛ばすためのリンクを埋め込む
            getBookItem.innerHTML = setBookElement;
            const link = $(`#link${i}`)[0];
            link.href = bookLink;
            // 途中で例外が発生した場合はcatchブロック内のコードが実行される
        }catch(e){
            continue;
        };
    };
});

// 検索されたデータを登録する
$('#bookItem').on('click', '.registration', function () {
    // クリックされたボタンに対応する書籍情報を取得
    const index = $(this).closest('.container').parent().index();
    console.log(index);
    const selectedBook = data.items[index];
    console.log(selectedBook);

    // 書籍情報から必要なデータを取得
    const bookImg = selectedBook.volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = selectedBook.volumeInfo.title;
    const bookLink = selectedBook.volumeInfo.infoLink;

    // 登録データを作成
    const obj = {
        img: bookImg,
        title: bookTitle,
        link: bookLink
    };

    // Firebaseにデータを登録
    const newPostRef = push(dbRef);
    set(newPostRef, obj);
});

//最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
onChildAdded(dbRef, function (data) {
    const obj = data.val();//オブジェクトデータを取得し、変数msgに代入
    const key = data.key;//データのユニークキー（削除や更新に必須）
    let html;
//表示用テキスト・HTMLを作成
    html = `
    <div class="${key}">
        <div class="container">
            <img src="${obj.img}"><br>
            <a href="${obj.link}" target="_blank">${obj.title}</a>
            <span class="remove" data-key="${key}">🗑</span>
        </div>
    </div>
    `;
$("#output").prepend(html); //#outputの最後に追加
});