// script.js
// Discord Webhook URL（GitHub Secretsから取得）
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1349340153583370362/iGi7H9jdVBI56dHW432r6_w3ZTxa1ECP_4MBWhIvTxmKqO-BcKnoZ_Me7GvC75ms-NUV';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const submitButton = document.getElementById('submitButton');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 送信ボタンを無効化
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
        errorMessage.style.display = 'none';
        
        // フォームデータの取得
        const formData = new FormData(form);
        const imageFile = formData.get('image');
        
        try {
            // 画像をBase64に変換
            let imageBase64 = null;
            if (imageFile && imageFile.size > 0) {
                imageBase64 = await convertToBase64(imageFile);
            }
            
            // Webhookに送信するデータの作成
            const webhookData = {
                content: null,
                embeds: [{
                    title: '新しい報告が届きました',
                    color: 0xFF0000, // 赤色
                    fields: [
                        {
                            name: 'カテゴリー',
                            value: formData.get('category'),
                            inline: true
                        },
                        {
                            name: '報告対象者のユーザー名',
                            value: formData.get('username'),
                            inline: true
                        },
                        {
                            name: '報告対象者のユーザーID',
                            value: formData.get('userid'),
                            inline: true
                        },
                        {
                            name: '詳細',
                            value: formData.get('details')
                        }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            // 画像が存在する場合は追加
            if (imageBase64) {
                webhookData.embeds[0].image = {
                    url: imageBase64
                };
            }

            // Discord Webhookに送信
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(webhookData)
            });

            if (!response.ok) {
                throw new Error('送信に失敗しました');
            }

            // 成功メッセージの表示
            form.reset();
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error('エラー:', error);
            errorMessage.textContent = 'エラーが発生しました。もう一度お試しください。';
            errorMessage.style.display = 'block';
        } finally {
            // 送信ボタンを再有効化
            submitButton.disabled = false;
            submitButton.textContent = '送信';
        }
    });
});

// 画像をBase64に変換する関数
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
