/**
 * 學程拼圖 - 學程分類頁(七大領域)動態篩選器
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. 定義篩選區塊 UI 與內嵌樣式
  const filterUI_HTML = `
    <div id="dynamic-filter-container" style="margin: 20px 0; padding: 20px; border-radius: 8px; background-color: #DDE9E5;">
        <style>
            #dynamic-filter-container { font-family: sans-serif; }

            /* 摺疊標題樣式 */
            summary.filter-toggle {
                cursor: pointer;
                font-size: 1.1em;
                font-weight: bold;
                color: var(--ntpu-oaa-green-dark, #2F4A41);
                outline: none;
                user-select: none;
                margin-bottom: 0;
            }
            /* 展開時為標題底部增加間距與分隔線 */
            details[open] summary.filter-toggle {
                margin-bottom: 15px;
                border-bottom: 1px solid #C4D6D0;
                padding-bottom: 10px;
            }

            .filter-section { display: flex; flex-direction: column; gap: 15px; }
            .search-box { width: 100%; max-width: 300px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
            .checkbox-groups { display: flex; flex-direction: column; gap: 10px; }
            .check-group { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
            .check-group strong { color: var(--ntpu-oaa-green-dark, #2F4A41); min-width: 80px; }
            .check-group label { cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: normal; margin: 0; }

            /* 順便處理各資訊之標題樣式， --ntpu-oaa-green-dark 另於全站頭部賦值 */
            .module-ptlist .mtitle a {
                font-weight: bold !important;
                color: var(--ntpu-oaa-green-dark) !important;
                text-decoration: none;
                font-size: larger;
            }
            .module-ptlist .mtitle a:hover {
                text-decoration: underline !important;
                color: var(--ntpu-oaa-green-dark);
            }

            /* Chip 標籤樣式 */
            .program-chip {
                display: inline-block;
                background-color: #DDE9E5;
                color: var(--ntpu-oaa-green-dark, #2F4A41);
                font-size: 0.9em;
                border-radius: 12px;
                padding: 2px 10px;
                margin-left: 6px;
                margin-bottom: 4px;
                font-weight: normal;
                white-space: nowrap;
            }
        </style>

        <details>
            <summary class="filter-toggle">依條件篩選</summary>

            <div class="filter-section">
                <input type="text" id="program-search" class="search-box" placeholder="可輸入學程名稱來篩選...">

                <div class="checkbox-groups">
                    <div class="check-group">
                        <strong>學程類型：</strong>
                        <label><input type="checkbox" value="單一領域微學程" checked> 單一領域微學程</label>
                        <label><input type="checkbox" value="跨領域微學程" checked> 跨領域微學程</label>
                        <label><input type="checkbox" value="學分學程" checked> 學分學程</label>
                        <label><input type="checkbox" value="跨校學分學程" checked> 跨校學分學程</label>
                    </div>
                    <div class="check-group">
                        <strong>授課語言：</strong>
                        <label><input type="checkbox" value="中文授課" checked> 中文授課</label>
                        <label><input type="checkbox" value="英文授課" checked> 英文授課</label>
                    </div>
                    <div class="check-group">
                        <strong>學制：</strong>
                        <label><input type="checkbox" value="學士" checked> 學士</label>
                        <label><input type="checkbox" value="碩士" checked> 碩士</label>
                    </div>
                </div>
            </div>
        </details>
    </div>
    `;

  // 2. 結構化定位
  const targetContainer = document.querySelector(".mpgdetail");
  if (targetContainer) {
    targetContainer.insertAdjacentHTML("beforeend", filterUI_HTML);
  } else {
    console.warn("未找到 .mpgdetail 區塊，無法插入篩選器。");
    return;
  }

  // 3. 取得控制元件
  const programItems = document.querySelectorAll(".listBS .d-item");
  const searchInput = document.getElementById("program-search");
  const checkboxes = document.querySelectorAll(
    '#dynamic-filter-container input[type="checkbox"]',
  );

  // 4. 解析資料並即時轉換 DOM 結構為 Chip
  programItems.forEach((item) => {
    const titleEl = item.querySelector(".mtitle a");
    const descEl = item.querySelector(".mdetail .meditor");

    item._filterData = {
      title: titleEl ? titleEl.textContent.trim() : "",
      tags: [],
    };

    if (descEl) {
      const fullText = descEl.textContent.trim();
      const parts = fullText.split("。");

      if (parts.length > 1) {
        // 將句號後的字串獨立出來處理
        const tagPart = parts.pop();
        // 將前半段描述重新組合並補回句號
        const mainDesc = parts.join("。") + "。";

        // 將正文中以【】包裹的字串轉換為紅色粗體樣式
        const styledMainDesc = mainDesc.replace(
          /【([^】]*)】/g,
          '<span style="color:#e74c3c; font-weight: bold;">【$1】</span>',
        );

        const rawTags = tagPart.split(" ").filter((t) => t.trim() !== "");
        const tags = [];
        const chipHTMLs = [];

        rawTags.forEach((t) => {
          if (t.startsWith("#")) {
            const cleanTag = t.replace("#", "").trim();
            tags.push(cleanTag);
            // 轉換為 span 並加入 aria-label ，提升無障礙體驗
            chipHTMLs.push(
              `<span class="program-chip" aria-label="標籤：${cleanTag}">${cleanTag}</span>`,
            );
          } else {
            chipHTMLs.push(t);
          }
        });

        item._filterData.tags = tags;

        // 將整理好的「文字敘述」與「Chip 標籤 HTML」重新寫入 DOM
        descEl.innerHTML = styledMainDesc + chipHTMLs.join(" ");
      }
    }
  });

  // 5. 篩選邏輯
  const executeFilter = () => {
    const keyword = searchInput.value.toLowerCase().trim();
    const activeTags = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    programItems.forEach((item) => {
      const { title, tags } = item._filterData;

      // 條件 A：關鍵字搜尋
      const matchKeyword =
        keyword === "" || title.toLowerCase().includes(keyword);

      // 條件 B：核取方塊標籤篩選
      let matchTags = true;
      for (let tag of tags) {
        const tagCheckboxExists = Array.from(checkboxes).some(
          (cb) => cb.value === tag,
        );
        // 如果學程擁有該標籤，但對應的核取方塊被取消勾選，則隱藏
        if (tagCheckboxExists && !activeTags.includes(tag)) {
          matchTags = false;
          break;
        }
      }

      // 找到最外層的 .listBS 包裝容器（每個學程獨佔一個 .row.listBS.boxSD）
      const rowWrapper = item.closest(".listBS") || item;

      // 隱藏整列包裝器，連同其 margin 一起消除，避免留白
      if (matchKeyword && matchTags) {
        rowWrapper.style.display = "";
      } else {
        rowWrapper.style.display = "none";
      }
    });
  };

  // 6. 綁定事件監聽
  if (searchInput) {
    searchInput.addEventListener("input", executeFilter);
  }
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", executeFilter);
  });
});
