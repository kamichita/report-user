// Discord Webhook URL（GitHub Secretsから取得）
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1367443152046391336/z80qt8U5P1ZwWWyqcz8aPMNucoS6p2YA_j66DqX4aFVqc4fehqa69Ggh9Die4lPEWi-p';

// reCAPTCHA シークレットトークン（キャプチャのトークンを使用）
const RECAPTCHA_SECRET_KEY = '0x4AAAAAABYVbk-ykyfOpQMHZiieNVvzpIw'; // ここはバックエンドで設定すべきですが、フロントエンドに書く場合は注意

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const submitButton = document.getElementById('submitButton');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // キャプチャのトークンを取得
        const token = document.querySelector('textarea[name="cf-turnstile-response"]')?.value;
        if (!token) {
            showError("認証に失敗しました。もう一度お試しください。");
            return;
        }

        // トークンをサーバー側で検証することが推奨されますが、ここではフロントエンドでそのまま送信する形です。
        // キャプチャのトークンもWebhookのデータに追加
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
        errorMessage.style.display = 'none';

        const formData = new FormData(form);
        const category = formData.get('category');
        const username = formData.get('username');
        const userid = formData.get('userid');
        const details = formData.get('details');
        const imageFile = formData.get('image');

        try {
            let imageBase64 = null;
            if (imageFile && imageFile.size > 0) {
                imageBase64 = await convertToBase64(imageFile);
            }

            const webhookData = {
                content: null,
                embeds: [{
                    title: '新しい報告が届きました',
                    color: 0xFF0000,
                    fields: [
                        { name: 'カテゴリー', value: category || '未入力', inline: true },
                        { name: '報告対象者のユーザー名', value: username || '未入力', inline: true },
                        { name: '報告対象者のユーザーID', value: userid || '未入力', inline: true },
                        { name: '詳細', value: details || '未入力' }
                    ],
                    timestamp: new Date().toISOString()
                }],
                // reCAPTCHAトークンもWebhookのデータとして送信
                custom_fields: {
                    recaptcha_token: token
                }
            };

            if (imageBase64) {
                webhookData.embeds[0].image = {
                    url: imageBase64
                };
            }

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookData)
            });

            if (!response.ok) throw new Error('Webhook送信に失敗しました');

            form.reset();
            showSuccess("報告が送信されました。");
        } catch (error) {
            console.error('エラー:', error);
            showError("送信に失敗しました。もう一度お試しください。");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '送信';
        }
    });
});

// 画像をBase64に変換する関数（Discord Webhookで使う用）
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// 成功・エラー表示関数（フォームの下にあるやつ）
function showSuccess(message) {
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    successMessage.textContent = message;
    successMessage.style.display = "block";
    errorMessage.style.display = "none";
    setTimeout(() => {
        successMessage.style.display = "none";
    }, 5000);
}

function showError(message) {
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    successMessage.style.display = "none";
}
