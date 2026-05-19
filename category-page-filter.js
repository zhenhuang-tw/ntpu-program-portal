/**
 * 學程拼圖 - 學程分類頁(七大領域)動態篩選器
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 定義篩選區塊 UI 與內嵌樣式
    const filterUI_HTML = `
    <div id="dynamic-filter-container" style="margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
        <style>
            #dynamic-filter-container { font-family: sans-serif; }
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
        </style>
        
        <div class="filter-section">
            <input type="text" id="program-search" class="search-box" placeholder="請輸入學程名稱...">
            
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
    </div>
    `;

    // 2. 結構化定位：直接尋找頁面中的大框架 .mpgdetail，不受說明文字改變的影響
    const targetContainer = document.querySelector('.mpgdetail');
    if (targetContainer) {
        targetContainer.insertAdjacentHTML('beforeend', filterUI_HTML);
    } else {
        console.warn('未找到 .mpgdetail 區塊，無法插入篩選器。');
        return;
    }

    // 3. 取得控制元件
    const programItems = document.querySelectorAll('.listBS .d-item');
    const searchInput = document.getElementById('program-search');
    const checkboxes = document.querySelectorAll('#dynamic-filter-container input[type="checkbox"]');

    // 4. 預先解析並快取各學程的標籤與名稱 (資料隱式綁定)
    programItems.forEach(item => {
        const titleEl = item.querySelector('.mtitle a');
        const descEl = item.querySelector('.mdetail .meditor');
        
        item._filterData = {
            title: titleEl ? titleEl.textContent.trim() : '',
            tags: []
        };

        if (descEl) {
            const text = descEl.textContent.trim();
            const parts = text.split('。');
            
            // 取最後一段（句號後方）解析 # 標籤
            if (parts.length > 1) {
                const tagPart = parts[parts.length - 1];
                const tags = tagPart.split(' ')
                                    .filter(t => t.trim().startsWith('#'))
                                    .map(t => t.trim().replace('#', ''));
                item._filterData.tags = tags;
            }
        }
    });

    // 5. 核心篩選邏輯
    const executeFilter = () => {
        const keyword = searchInput.value.toLowerCase().trim();
        const activeTags = Array.from(checkboxes)
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);

        programItems.forEach(item => {
            const { title, tags } = item._filterData;

            // 條件 A：關鍵字搜尋
            const matchKeyword = keyword === '' || title.toLowerCase().includes(keyword);

            // 條件 B：核取方塊標籤篩選
            let matchTags = true;
            for (let tag of tags) {
                const tagCheckboxExists = Array.from(checkboxes).some(cb => cb.value === tag);
                // 如果學程擁有該標籤，但對應的核取方塊被取消勾選，則隱藏
                if (tagCheckboxExists && !activeTags.includes(tag)) {
                    matchTags = false;
                    break;
                }
            }

            // 根據兩者交集結果進行顯示或隱藏
            if (matchKeyword && matchTags) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    };

    // 6. 綁定事件監聽
    if (searchInput) {
        searchInput.addEventListener('input', executeFilter);
    }
    checkboxes.forEach(cb => {
        cb.addEventListener('change', executeFilter);
    });
});
