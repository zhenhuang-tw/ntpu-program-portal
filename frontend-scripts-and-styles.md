以下是全站共用之樣式，以覆蓋預設樣式；或，插入全站共用之 JavaScript 程式碼。

## 樣式

### 連結

考量：RPage 廠商為本校客製之主題中，連結預設樣式與一般文字相同，不利使用者體驗，故改以主題色來呈現連結。

方式：在共用頭部插入一個 `<style type="text/css">` 區塊，貼上即可。

#### 新生專區 (紫色主題)

因新生專區對外資料呈現方式統一（使用內建表格輸出各資料簡短介紹），故無需由使用者自己在 GUI 設定樣式表類別，而是從共用頭部統一設定。

```css

:root {
    --themePurple: #393d75;
     --themePurpleLight: #4e5b99;
    --themePurpleDark: #2f3369;
}
div.M23 div.mpgdetail a, div.module-rcglist div#pageptlist div.mdetail a,div.tab-content div.mouter table.listTB div.mdetail a{
    text-decoration: underline;
    color: var(--themePurple);
}
div.M23 div.mpgdetail a:hover,div.M23 div.mpgdetail a:focus, div.module-rcglist div#pageptlist div.mdetail a:hover, div.module-rcglist div#pageptlist div.mdetail a:focus,div.tab-content div.mouter table.listTB div.mdetail a:hover,div.tab-content div.mouter table.listTB div.mdetail a:focus{
    text-decoration: none;
    color: var(--themePurpleLight);
}
div.M23 div.mpgdetail a:visited, div.module-rcglist div#pageptlist div.mdetail a:visited ,div.tab-content div.mouter table.listTB div.mdetail a:visited{
    text-decoration: none;
    color: var(--themePurpleDark);
}
```

#### 畢業生專區 (棕色主題)

```css
a.grad-portal-link{
  color: #554439;
  text-decoration: underline;
}
a.grad-portal-link:hover{
  color: #554439;
  text-decoration: none;
}
```

#### 學程拼圖 (綠色主題)

```css
:root {
 --ntpu-oaa-green-dark: #2F4A41;
 --ntpu-oaa-green-light: #37564C;
}
a.ntpu-oaa{ color: var(--ntpu-oaa-green-dark); text-decoration: underline; }
a.ntpu-oaa:hover{ color: var(--ntpu-oaa-green-light); text-decoration: none; }
```

## 區塊式的資訊清單

#### 畢業生專區 (棕色主題)

設定位置：在各分類「編輯分類」->「詳細說明」底部插入一個 `<script>` 區塊後貼上。

```js
(function() {
    // 建立一個 style 標籤
    var style = document.createElement('style');
    style.type = 'text/css';
    
    // 定義針對標題連結的樣式
    // .module-ptlist .mtitle a 鎖定該區塊內的標題連結
    var css = `
        .module-ptlist .mtitle a {
            font-weight: bold !important;
            color: #625144 !important;
            text-decoration: none; 
            font-size: larger;
        }
        .module-ptlist .mtitle a:hover {
            text-decoration: underline !important; /* 滑鼠移過顯示底線 */
            color: #625144; /* 保持顏色一致 */
        }
    `;

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    // 將樣式表掛載到 head 中
    document.getElementsByTagName('head')[0].appendChild(style);
})();
```

## 程式

### 插入頂部無障礙 key

操作：RPage 客製之頭部中，已經有一個 `<script>` 區塊，貼上即可。

```js
/**
 * 無障礙網頁規範：自動插入頂部定位點 (Access Key U)
 * 目的：協助視障使用者透過快捷鍵 (Alt+U) 快速跳轉至上方導覽區。
 * 標示：使用「:::」作為導盲磚視覺符號，並設定 accesskey="U"。
 * 實作考量事項：因 RPage 係產生動態 ID，爰以結構化 CSS 選擇器定位，並插入選單首位。
 */
document.addEventListener('DOMContentLoaded', function() {
    // 使用 CSS 選擇器鎖定選單容器，避免動態 ID 導致失效
    const topNav = document.querySelector('.hdmenu ul.nav.navbar-nav');

    if (topNav) {
        // 建立清單項目 li
        const anchorLi = document.createElement('li');
        anchorLi.className = 'dropdown'; // 延用原選單樣式類別
        
        // 建立定位點超連結
        // href="#U" 與 name="U" 形成錨點，accesskey="U" 供快捷鍵觸發
        anchorLi.innerHTML = `
            <a href="#start-U" id="AU" name="start-U" accesskey="U" title="上方導覽區 (Alt+U)" class="accesskey">
                :::
            </a>
        `;

        // 將定位點插入到選單的最前方 (第一個節點之前)
        topNav.insertBefore(anchorLi, topNav.firstChild);
    }
});
```
