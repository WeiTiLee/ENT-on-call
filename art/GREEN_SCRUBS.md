# 刀房綠色刷手服

- 工具：內建 imagegen 圖像編輯（非 CLI）。
- 輸出素材：`dist/assets/art/resident-green-scrubs-v1.png`，1269×1240，透明背景。
- 動畫裁切資料：`dist/assets/art/green-scrub-frames.json`，男女各八個站立／行走影格。
- 輸入：既有男女主角 sprites，作為角色身份與姿勢參考。
- 只在 F5 使用新素材；7F、2G 及其他樓層仍使用原本白袍素材。原本男女白袍 sprites 與表情 portraits 的檔案內容均未變更。

## 使用的提示詞

```text
Use case: precise-object-edit. Asset type: transparent 4-by-4 sprite atlas for the existing ENT on call game. Edit targets: image 1 male resident and image 2 female resident. Produce ONE atlas containing ONLY their surgical scrub outfits, recolored from navy blue to hospital surgical GREEN, matching the provided real operating-room photos' green scrubs. Preserve the exact anime illustration style, identities, dark hair, faces, masks, proportions, shoes, shading and the existing standing/walking poses from the references. Layout MUST be 4 equal columns and 4 equal rows with generous transparent gutters, no overlap, full body and feet visible within every cell. Row 1: MALE in GREEN scrub shirt and GREEN scrub pants, standing front, left-facing profile, back, right-facing profile. Row 2: same MALE GREEN outfit, walking front, left-facing profile, back, right-facing profile. Row 3: FEMALE in GREEN scrub shirt and GREEN scrub pants, standing front, left-facing profile, back, right-facing profile. Row 4: same FEMALE GREEN outfit, walking front, left-facing profile, back, right-facing profile. Keep the surgical caps blue and face masks pale blue as in references; change only the scrub shirts and trousers to a clearly recognizable medium surgical green (roughly #2f8a68, with natural light/dark fabric folds). The source white coat figures will remain separate in the game, so DO NOT include any white coat figures in this atlas. Each figure same scale and centered in its cell, head-to-feet about 85 percent of cell height, leaving clear transparent spacing above/below and between figures. Genuine transparent background. No text, grid lines, labels, gradients outside figures, scenery or watermark.
```
