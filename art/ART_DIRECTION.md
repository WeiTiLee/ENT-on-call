# 動畫美術版 v0.3

使用者提供的《耳鼻喉科值班主角設定集》為角色與風格基準，原圖存於 `art/主角設定參考.png`。主角是虛構的成年 ENT R 住院醫師：黑色短髮、深藍刷手服、短袖白袍，認真而略顯疲倦。圖中年齡等背景供造型參考，遊戲仍允許輸入玩家暱稱。

## 實作

保留可走動醫院與原有任務，採用 2.5D：透明手繪角色圖集結合立體醫院；進刀房切換刷手服、手術帽及口罩，四向角色具待機與行走步態。角色圖集不是全 3D 骨架模型。

八種表情依來電、緊急會診、精力與深夜狀態切換。護理站、初診間、急診、刀房、值班室與清晨走廊的六張場景插畫用於劇情與場景提示。移動場景採分層陰影、輪廓線與冷藍／暖琥珀光。介面是深藍工作面板與暖灰紙面。

素材使用內建 ImageGen 產生，未使用 CLI。圖集以 CSS／WebGL 的取樣範圍直接使用，沒有外部圖片服務。角色與背景圖均依使用者參考新生成。保留原範本署名、醫療提醒及玩法。

## 最終素材

- `dist/assets/art/resident-sprites-v2.png`：四向、兩套服裝、待機／步態，共十六格，透明 PNG。
- `dist/assets/art/resident-portraits-v2.png`：八種表情。
- `dist/assets/art/hospital-scenes-v2.png`：六個醫院環境。

## 最終提示詞

### sprites

Use case: stylized-concept. Asset type: transparent 2.5D browser game character sprite atlas. Reference image: the supplied ENT resident character design is the identity and art-style reference, NOT a sheet to reproduce. Create a precise 4-column by 4-row atlas, sixteen isolated FULL BODY figures, each centered in an equal rectangular cell, consistent scale and baseline, generous transparent margins. No frames, labels, numbers, shadows outside the figure or text. Same adult 25-year-old slim East Asian male, tousled short black hair, warm brown eyes, serious kind slightly tired expression, natural adult proportions, 7.5 heads tall, NOT chibi. Detailed hand-drawn Japanese anime linework, subtle painterly shading, navy cool shadows and warm amber edges matching the reference. Orthographic view with a slightly elevated game camera, feet completely visible. Four columns always: front view, left-facing profile, back view, right-facing profile. Row 1: standing idle in short-sleeved white doctor coat over dark navy V-neck scrubs and navy trousers, gray sneakers, ID badge and stethoscope. Row 2: same whitecoat outfit and directions, natural walking stride with one foot forward and mild arm swing. Row 3: standing idle in dark navy surgical scrubs with blue surgical cap and light surgical mask, same trousers and sneakers, same four directions. Row 4: same scrub outfit and directions in a walking stride. The full body of each sprite must be strictly inside its equal cell; no overlap between cells. Transparent background.

### portraits

Use case: illustration-story. Asset type: expression portrait atlas for an ENT medical visual-novel game. Reference image: identity and painting style. Create an EXACT seamless 4-column by 2-row contact sheet of EIGHT equal-square portrait panels, no gaps, no borders, no text. Each panel shows the same 25-year-old adult East Asian male ENT resident from the reference: tousled black hair, brown eyes, slim face, white short-sleeved coat over navy V-neck scrubs, ID lanyard and stethoscope. Frame each identically from upper chest to above the hair, face centered at same height; natural adult anatomy. Premium Japanese anime illustration, expressive eyes, fine rough pencil/ink edges, softly painted realistic lighting, slate blue shadows, warm amber rim light, desaturated hospital behind him. Top row left to right: neutral attentive, intensely focused, startled by a call, sleepy half-open eyes. Bottom row: visibly tired, quietly exasperated deadpan, small relieved smile, comic internal panic with open mouth (still same adult face, restrained anime exaggeration). No text or logos. Equal panel boundaries must be at exactly 25%,50%,75% width and 50% height.

### scenes

Use case: stylized-concept. Asset type: environment illustration atlas for an ENT on-call game. Supplied reference image is the visual tone and hospital atmosphere reference. Create EXACTLY a 2-column by 3-row sheet of six equal landscape 16:9 illustrations, no gutters or frames, no text, no labels, no logos or recognizable people. Hand-painted Japanese medical slice-of-life anime background art, detailed expressive ink edges, textured soft brushwork, cinematic warm amber task lighting mixed with cool navy/slate blue shadows, atmospheric and believable contemporary Taiwanese hospital. Every scene is an interior view at human eye level, no dollhouse or aerial view. Upper left: 7th-floor nursing station, warm wood counter, computers, corridor and blue-green bed curtains, late-afternoon light. Upper right: ENT consultation room, black exam chair beside stainless ENT treatment unit, blue instrument covers, articulated exam lamp, beige walls, wood cabinets with sink, computers and printer. Middle left: emergency department with curtained beds, monitors and blue nighttime ceiling light, bright examination lamp. Middle right: operating room, navy and teal sterile drapes, overhead surgical lights, steel instrument table, anesthesia equipment, no graphic operation. Lower left: small lived-in on-call room, narrow bed with rumpled gray-blue blanket, old desk, phone beside a takeaway cup, dim warm bedside lamp against a dark blue night window. Lower right: dawn hospital corridor with 7F nursing station in distance, soft sunrise and cool blue shadows. Keep screens as abstract unreadable light shapes, no patient information. Dense convincing backgrounds with a strong painterly feel that match the reference.


## v0.3 追加需求

女主角與男主角採同一個美術方向，兩者都具白袍與刀房服、四向與步態、八種表情；可在開場選擇。女主角為虛構成年 ENT R，黑髮低馬尾、深藍刷手服與白袍。

7F 已依後續提供的平面圖重新配置，並按使用者確認旋轉 180 度：護理站與訪客梯在畫面下方、值班室與交誼廳在上方；7F01～13 在右側，7F25～15 在左側。平面圖與 3D 場景共用 ward-plan.js，22 間病房及中央工作區有逐房資料。2G 具兩張診療椅，工作桌座位背對後方木櫃與診療椅。

狀態列改為體力、飽足、脾氣；脾氣以越高越煩躁解讀，來電／反覆處理會上升，休息、吃飯、完成會診可緩和，只影響表情與內心 OS。

### 女主角素材

- `dist/assets/art/resident-female-sprites-v3.png`
- `dist/assets/art/resident-female-portraits-v3.png`

### female_sprites

Use case: stylized-concept. Asset: transparent 4-column by 4-row full-body character atlas, same production style as the existing ENT male sprite atlas. Input image 1 is the visual style and adult medical clothing reference. Input image 2 is the atlas layout reference, NOT the subject identity. Create a NEW female protagonist who looks like an adult East Asian ENT resident about 25, slim natural 7.5-head adult proportions, short-to-medium dark black hair gathered in a practical small low ponytail, side-parted loose strands, warm brown eyes, calm kind focused expression. No skirt, no heels, no sexualized features, no chibi. Fine Japanese anime ink linework and realistic soft painterly cel shading, slate blue cool shadows and amber rim light, exactly compatible with input reference. EXACT 4 columns and 4 rows, sixteen distinct figures, each entirely inside an equal cell, centered at same baseline and scale. Columns: front, left-facing profile, back, right-facing profile. Row 1: standing idle in short-sleeved white doctor coat over navy V-neck scrubs, navy straight trousers, gray sneakers, stethoscope and ID badge. Row 2: same whitecoat outfit and views, walking stride with one foot forward and natural arm swing. Row 3: idle in navy surgical scrubs with blue cap, light surgical mask, navy trousers and gray sneakers; hair tucked under cap. Row 4: same surgical outfit and views in walking stride. Show all feet and full hair with generous equal transparent gutters around every sprite. Canvas square, transparent background, no frames, no labels, no text or extra objects.

### female_portraits

Use case: illustration-story. Asset: expression portrait atlas for an ENT browser game. Input 1 is the medical anime art direction. Input 2 is the male portrait atlas to MATCH in painting, lighting, framing and exact panel layout; create a female counterpart, NOT the male character. Exact 4-column by 2-row seamless atlas of eight equal portrait panels with no borders or gaps or text. Same NEW adult 25-year-old East Asian female ENT resident in every panel: practical small low ponytail of black hair, side-parted loose dark strands framing her face, warm brown eyes, slim natural adult face, white short-sleeved doctor coat over navy V-neck scrubs, stethoscope and ID lanyard. Portraits framed from upper chest to above hair, matched scale and face height across all panels. Fine expressive anime ink drawing, soft detailed realistic painting, amber hospital rim light and slate/navy cool shadows, blurred desaturated hospital backdrop, contemporary medical slice-of-life anime. Top row: neutral attentive, intensely focused, surprised by a call, sleepy half-open eyes. Bottom row: fatigued, quietly exasperated deadpan, warm relieved small smile, comic internal panic with open mouth and a sweat drop. Keep her recognizably adult and the same person. Same visual quality as the male reference. No labels, logos or text; exact panel boundaries at 25/50/75% width and 50% height.


### 初診間插畫配置修正

最終使用 `dist/assets/art/hospital-scenes-v3.png`，舊版存於 `art/hospital-scenes-v2.png`，不進入部署。以內建 ImageGen 進行局部修改，提示詞：

Use case: precise-object-edit. Edit target: the provided hospital illustration atlas. Preserve the EXACT 2-column 3-row atlas layout and all FIVE OTHER panels unchanged. Change ONLY the UPPER RIGHT panel (the ENT consult room). Correct the actual room layout: TWO black ENT examination chairs, each beside its own stainless-steel ENT treatment unit with a blue instrument cover and articulated examination lamp, at the REAR of the room. A long wood cabinet/counter with sink runs along the far back wall. Two computer workstations with printer and desk phones stand across the FOREGROUND, oriented so that a person seated at the computer would FACE THE FOREGROUND and have their BACK TO the rear wood cabinet and the two examination chairs. No people present. Chairs for computer users should be on the rear side of the foreground desks, screens should face these seats, away from the viewer. Maintain the same hand-painted Japanese medical anime background style, dark navy/slate shadows and warm task lighting, same hospital beige wood/steel equipment, no readable screen contents or text. The upper-left nursing station, middle-left ED, middle-right OR, lower-left duty room, lower-right dawn corridor must remain visually unchanged. No panel borders, no lettering.


## 職級顯示修正

依使用者最後要求，遊戲介面、角色介紹與選角卡統一顯示 ENT R，不指定年級。前述提示詞保留實際生成紀錄；成品介面不顯示 R2。

7F 連通 G 棟的入口移至電梯側。房號與室名使用高對比介面文字，保持螢幕字級，避免地板透視造成模糊。2G 在既有列印桌與洗手台旁加入卡紙、補衛生紙互動。

## 2026-10-23 F5 刀房場景

使用新提供的刀房照片作為配色、設備外形與空間辨識參考：黃綠牆板、綠色鋪單、兩盞圓形手術燈、麻醉監測、金屬器械台。維持既有 2.5D 程式模型，俯視時不加整面天花板，以保留病床周邊視野。實景照片中的人員、病人與螢幕內容不作為遊戲素材。主走廊依指定的 17／16／15、12／13 關係配置；支走廊僅示意其他房號。

13 與 16 號各有獨立室內場景，鏡頭固定在單間刀房中央，以原本單室場景的尺度呈現手術台、雙燈、監測與器械台。主走廊以關閉的門作為入口，室內只保留手術台與返回走廊的標記，不顯示其他刀房。

## 2026-10-23 場景細化

參考使用者提供的原作遊玩畫面，取其物件密度、床架結構及光影層次。維持本作成年動畫角色、冷藍陰影、暖木／琥珀工作燈，未擷取參考畫面的素材。

- 7F：病床增加輪架、護欄立柱、分層床墊／枕頭、床單縫線、床尾 A／B／C 小牌、床頭醫療面板、點滴架與床邊櫃。簾幕有軌道及摺線，地面有磚縫與接觸陰影。房號牌位於門外，避免擋住床位標記。
- 護理站／中央工作區：補鍵盤、電話、紙張、文件夾、杯子、備品、抽屜推車、候診椅、公告板、儲物架、更衣櫃、討論桌椅及值班室檯燈。護理站、值班室有局部暖光。
- 2G：木櫃門縫、把手、雙工作桌鍵盤／文件、印表機紙張、雙診療椅附近的器械、抽屜、瓶罐與弧形管線。既有兩椅、兩桌朝向保持一致。
- F5：13／16 號入口增加滑門軌道、門禁及防撞板；室內增加床台輪架、鋪單摺線、器械盤、推車、監測波形及管線，保留照片中的黃綠牆面與雙圓燈。只顯示既有房號。
- 1F：補床頭面板、點滴架、床架輪、監測畫面與推車。

`dist/game/scene-details.js` 集中管理裝飾模型；重複零件以 InstancedMesh 合併，螢幕／公告板由本機 Canvas 繪製虛構內容。裝飾層不新增碰撞或互動點，沿用已確認的房間資料、路徑與事件。材質採柔和受光與接觸陰影，病房視角稍帶斜角；畫面右上提供「−／＋」視野控制，縮放限制為 0.8～1.7 倍。
