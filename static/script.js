async function uploadImage() {
    const input = document.getElementById('image-upload');
    if (input.files.length === 0) {
        alert("Please select an image to upload.");
        return;
    }

    const formData = new FormData();
    formData.append('file', input.files[0]);

    const response = await fetch('/detect/', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    displayResults(data);
}

function displayResults(data) {
    const input = document.getElementById('image-upload');
    const image = new Image();
    image.src = URL.createObjectURL(input.files[0]);
    
    image.onload = function() {
        const canvas = document.getElementById('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        data.detections.forEach(det => {
            const [x1, y1, x2, y2] = det.box;
            const confidence = det.confidence.toFixed(2);

            ctx.beginPath();
            ctx.rect(x1, y1, x2 - x1, y2 - y1);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = 'yellow';
            ctx.fillRect(x1, y1 - 20, 35, 20);

            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.fillText(confidence, x1 + 5, y1 - 5);
        });
        document.getElementById('output').appendChild(canvas);
        canvas.style.display = 'block';
    };
}