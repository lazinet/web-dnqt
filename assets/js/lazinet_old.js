// function toggleFlip(card) {
//     card.classList.toggle('flipped');
//   }  

// function googleTranslateElementInit() {
      //   new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
      // }
    
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({
          pageLanguage: 'vi',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          "includedLanguages": "en,zh-CN,hi,es,fr,ar,ru,pt,ja,ko,id,ms,th,my,km,lo,tl,de,it,fa,ur,pl,tr,uk,ro,nl,sv,cs,he,el,hu,da,fi",
          autoDisplay: false
        }, 'google_translate_element');
      }

// BONG BÓNG CHAT
    document.addEventListener('DOMContentLoaded', function() {
    const mainBtn = document.querySelector('.lazinet-contact-main-btn');
    const contactButtons = document.querySelector('.lazinet-contact-buttons');
    const contactBtns = document.querySelectorAll('.lazinet-contact-btn');
    
    // Main button click - Ẩn nút chính, hiện 4 nút con
    if (mainBtn) {
        mainBtn.addEventListener('click', function() {
            // Ẩn nút chính
            this.classList.add('hidden');
            // Hiện 4 nút con
            contactButtons.classList.add('active');
        });
    }
    
    // Xử lý click cho từng nút con
    contactBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.classList[1]; // phone, zalo, messenger, ai-bot
            
            // Thực hiện chức năng tương ứng
            switch(type) {
                case 'phone':
                    window.open('tel:+84-908556220');
                    break;
                case 'zalo':
                    window.open('http://zalo.me/0908556220', '_blank');
                    break;
                case 'messenger':
                    window.open('https://m.me/61567050494124', '_blank');
                    break;
                case 'ai-bot':
                    openAIChat();
                    break;
            }
            
            // Sau khi click: Ẩn 4 nút con, hiện lại nút chính
            contactButtons.classList.remove('active');
            mainBtn.classList.remove('hidden');
        });
    });
    
    function openAIChat() {
        // Thêm logic mở AI chat của bạn ở đây
        console.log('Opening AI Chat...');
        // Ví dụ: window.open('/ai-chat', '_blank');
    }
    
    // Optional: Đóng menu khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.lazinet-contact-floating') && 
            contactButtons.classList.contains('active')) {
            contactButtons.classList.remove('active');
            mainBtn.classList.remove('hidden');
        }
    });
});

// Random Content

    // Mảng chứa tất cả các phiên bản content
    const heroContents = [
        {
            subtitle: '<span>Mới!</span> Kiến trúc sư Chuyển đổi Số',
            title: 'Giải pháp công nghệ <span>mạnh mẽ, mở rộng & thông minh</span> thích ứng <span>linh hoạt với nhiều mô hình kinh doanh</span>',
            description: 'Đội ngũ chuyên gia LAZINET kết hợp công nghệ tiên tiến với kinh nghiệm thực chiến để mang đến giải pháp toàn trình, đảm bảo doanh nghiệp bạn vận hành tối ưu và phát triển đột phá.'
        },
        {
            subtitle: '<span>Đột phá!</span> Kiến tạo Doanh nghiệp Thông minh',
            title: 'Hệ sinh thái công nghệ <span>linh hoạt, thích ứng & tự động hóa</span> chuyển đổi toàn diện <span>vận hành doanh nghiệp</span>',
            description: 'Chuyên gia LAZINET tích hợp AI, IoT và nền tảng số tiên tiến vào giải pháp toàn diện, giúp doanh nghiệp bạn vận hành thông minh, hiệu quả vượt trội và tăng trưởng bền vững.'
        },
        {
            subtitle: '<span>Tiên phong!</span> Đối tác Công nghệ Chiến lược',
            title: 'Nền tảng số <span>toàn diện, thông minh & tùy biến</span> mang lại <span>lợi thế cạnh tranh đột phá</span>',
            description: 'Đội ngũ chuyên gia LAZINET phối hợp công nghệ đỉnh cao với hiểu biết sâu sắc ngành nghề để triển khai giải pháp toàn diện, biến thách thức số thành cơ hội phát triển vượt bậc.'
        },
        {
            subtitle: '<span>Mới!</span> Kiến trúc sư Doanh nghiệp Số',
            title: 'Giải pháp chuyển đổi số <span>mạnh mẽ, mở rộng & thông minh</span> thích ứng <span>nhanh chóng với xu hướng tương lai</span>',
            description: 'Chuyên gia LAZINET kết hợp công nghệ tiên phong với kinh nghiệm phong phú để cung cấp giải pháp toàn diện, đảm bảo doanh nghiệp bạn chuyển đổi thành công và vươn lên dẫn đầu.'
        },
        {
            subtitle: '<span>Đột phá!</span> Kiến tạo Tương lai Số',
            title: 'Công nghệ <span>thông minh, linh hoạt & mạnh mẽ</span> chinh phục <span>những thành công mới</span>',
            description: 'Đội ngũ chuyên gia LAZINET tích hợp giải pháp công nghệ tiên tiến với chiến lược kinh doanh, mang đến hệ sinh thái số toàn diện giúp doanh nghiệp vận hành hiệu quả và phát triển vượt bậc.'
        }
    ];

    // Hàm random content
    function randomizeHeroContent() {
        const randomIndex = Math.floor(Math.random() * heroContents.length);
        const content = heroContents[randomIndex];
        
        document.getElementById('hero-subtitle').innerHTML = content.subtitle;
        document.getElementById('hero-title').innerHTML = content.title;
        document.getElementById('hero-description').textContent = content.description;
        
        // Ghi log để debug (có thể xóa sau)
        console.log('Đã load hero content version:', randomIndex + 1);
    }

    // Chạy khi trang load
    document.addEventListener('DOMContentLoaded', randomizeHeroContent);

    // Hàm random Description Only
    function randomizeHeroDescriptionOnly() {
        const randomIndex = Math.floor(Math.random() * heroContents.length);
        const content = heroContents[randomIndex];

        document.getElementById('hero-description').textContent = content.description;
        
        // Ghi log để debug (có thể xóa sau)
        console.log('Đã load hero content version:', randomIndex + 1);
    }

    // Chạy khi trang load
    document.addEventListener('DOMContentLoaded', randomizeHeroDescriptionOnly);

    // Hoặc có thể random mỗi lần refresh
    // randomizeHeroContent();


// Biến global (nếu chưa có)
    const SUBMIT_COOLDOWN_MS = 60000; // 1 phút giữa các submit   

//  FORM LIÊN HỆ ================================================================================================================================================================================ 
// Biến global (nếu chưa có)

    document.getElementById('contact-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định của form
        const button = document.getElementById('submit-btn');

        // Kiểm tra rate limiting với localStorage
        const lastSubmitTime = localStorage.getItem('lastContactSubmitTime');
        const now = Date.now();
        if (lastSubmitTime && (now - parseInt(lastSubmitTime)) < SUBMIT_COOLDOWN_MS) {
            const remainingTime = Math.ceil((SUBMIT_COOLDOWN_MS - (now - parseInt(lastSubmitTime))) / 1000);
            button.textContent = `Chờ ${remainingTime}s`;
            button.style.color = 'orange';
            setTimeout(() => {
                button.textContent = 'Gửi tin nhắn';
                button.style.color = '#ff6500';
            }, 2000);
            return; // Dừng submit
        }

        button.textContent = 'Đang gửi ... LAZINET';
        button.style.color = '#ff6500'; // Màu cam
        button.disabled = true;

        // Lấy dữ liệu từ form
        const formData = {
            name: document.getElementById('name').value.trim(),
            userType: document.getElementById('user-type').value.trim(),
            otherType: document.getElementById('other-type').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
        };

        try {
            // Honeypot check: Nếu field ẩn có giá trị → spam, chặn submit
            const honeypotValue = document.getElementById('website-contact').value.trim();
            if (honeypotValue !== '') {
                console.warn('Honeypot detected: Potential spam attempt');
                throw new Error('Yêu cầu không hợp lệ. Vui lòng thử lại.');
            }

            // Gửi yêu cầu POST với no-cors
            await fetch('https://script.google.com/macros/s/AKfycbz4t2LtIb1In7obXC_EKujEH3ZJGbvrz3uevuqVw4d-zErIj3Tf10QWwxlWH2-5IJ7KqA/exec', {
                method: 'POST',
                mode: 'no-cors', // Bỏ qua kiểm tra CORS
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Thành công: Lưu timestamp (honeypot đã pass) và reset form
            localStorage.setItem('lastContactSubmitTime', now.toString());
            document.getElementById('contact-form').reset(); // Reset toàn bộ form
            document.getElementById('other-type').style.display = 'none'; // Reset hidden field
            document.getElementById('user-type').style.width = '100%'; // Reset select width

            // Hiển thị thông báo thành công
            button.textContent = 'Đã gửi. LAZINET sẽ phản hồi sớm nhất có thể, trân trọng cám ơn!';
            button.style.color = '#ffffff'; // Màu xanh lá
            button.disabled = true; // Khóa nút để tránh gửi lại

            // Tùy chọn: Reset button sau 10 giây để cho phép submit mới
            setTimeout(() => {
                button.textContent = 'Gửi tin nhắn';
                button.style.color = '#ff6500';
                button.disabled = false;
            }, 10000);

        } catch (error) {
            // Hiển thị thông báo lỗi
            button.textContent = `Error: ${error.message}`;
            button.style.backgroundColor = '#FF3333'; // Đổi màu nền (màu đỏ)
            button.disabled = false;
        }
    });

    window.addEventListener('DOMContentLoaded', function () {
        const userTypeSelect = document.getElementById('user-type');

        // Kiểm tra nếu giá trị mặc định là ""
        function updateSelectColor() {
            if (userTypeSelect.value === "") {
                userTypeSelect.style.color = "#595959"; // Màu của placeholder
            } else {
                userTypeSelect.style.color = ""; // Đặt lại màu khi chọn giá trị khác
            }
        }

        // Cập nhật màu khi load trang
        updateSelectColor();

        // Thêm sự kiện khi người dùng chọn một giá trị khác
        userTypeSelect.addEventListener('change', function () {
            updateSelectColor(); // Cập nhật màu khi chọn thay đổi
        });
    });

    document.getElementById('user-type').addEventListener('change', function () {
        const otherInputContainer = document.getElementById('other-type');
        const userType = document.getElementById('user-type');

        if (this.value === 'Other') {
            userType.style.width = '30%'; // Thu hẹp dropdown userType
            otherInputContainer.style.display = 'inline-block'; // Hiển thị input
            otherInputContainer.setAttribute('required', ''); // Thêm thuộc tính required
        } else {
            userType.style.width = '100%'; // Trả lại kích thước ban đầu
            otherInputContainer.style.display = 'none'; // Ẩn trường nhập liệu
            otherInputContainer.removeAttribute('required'); // Xóa thuộc tính required
        }
    });
    

    // FORM NEWSLETTER ================================================================================================================================================================================
    // Biến global (nếu chưa có)
    async function submitNewsletter() {
        const email = document.getElementById('email-newsletter').value.trim();
        const button = document.getElementById('newsletter-btn');

        // Kiểm tra rate limiting với localStorage
        const lastSubmitTime = localStorage.getItem('lastNewsletterSubmitTime');
        const now = Date.now();
        if (lastSubmitTime && (now - parseInt(lastSubmitTime)) < SUBMIT_COOLDOWN_MS) {
            const remainingTime = Math.ceil((SUBMIT_COOLDOWN_MS - (now - parseInt(lastSubmitTime))) / 1000);
            button.textContent = `Chờ ${remainingTime}s`;
            button.style.color = 'orange';
            setTimeout(() => {
                button.textContent = 'Đăng ký';
                button.style.color = '#ff5000';
            }, 2000);
            return; // Dừng submit
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            button.textContent = 'Lỗi Email!';
            button.style.color = 'red';
            button.disabled = false;
            return;
        }

        // Honeypot check: Nếu field ẩn có giá trị → spam, chặn submit
        const honeypotValue = document.getElementById('website-newsletter').value.trim();
        if (honeypotValue !== '') {
            console.warn('Honeypot detected: Potential spam attempt');
            button.textContent = 'Yêu cầu không hợp lệ!';
            button.style.color = 'red';
            setTimeout(() => {
                button.textContent = 'Đăng ký';
                button.style.color = '#ff5000';
            }, 3000);
            return; // Dừng submit
        }

        button.textContent = 'Đang đăng ký';
        button.style.color = '#ff5000'; // Màu cam
        button.disabled = true;

        try {
            // Gửi yêu cầu POST
            const response = await fetch(
                'https://script.google.com/macros/s/AKfycbz38pxrAZj7NprlijMQszw3k1tRL1YC8Phzlcl7v7mAZfd8_JGqOgAP6rusC2ZkrK2E/exec',
                {
                    method: 'POST',
                    mode: 'no-cors', // Bỏ qua kiểm tra CORS
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            // Thành công: Lưu timestamp (honeypot đã pass)
            localStorage.setItem('lastNewsletterSubmitTime', now.toString());

            button.textContent = 'Đã đăng ký!';
            button.style.color = '#0000FF';
            document.getElementById('email-newsletter').value = "";

        } catch (error) {
            button.textContent = `Error: ${error.message}`;
            button.style.color = 'red';
            button.disabled = false;
        }
    }

// Tech Grid Animation =================================================================================================================================================================
    const canvas = document.getElementById("tech-grid");
    const ctx = canvas.getContext("2d");
    const card = document.getElementById("tech-grid-boundary");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const nodes = [];
    const screenWidth = window.innerWidth;
    const referenceWidth = 1920; // Full HD phổ biến hơn
    const baseNodes = 15; // Base ít hơn
    const numNodes = Math.max(8, Math.min(20, Math.round(baseNodes * screenWidth / referenceWidth)));
    let mouseNode = null;

    function randomRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function initializeNodes() {
      nodes.length = 0;
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: randomRange(10, canvas.width - 10),
          y: randomRange(10, canvas.height - 10),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: getRandomColor()
        });
      }
      const edgeNodes = [
        { x: randomRange(10, canvas.width - 10), y: 10, vx: (Math.random() - 0.5) * 1, edge: 'top', color: getRandomColor() },
        { x: canvas.width - 10, y: randomRange(10, canvas.height - 10), vy: (Math.random() - 0.5) * 1, edge: 'right', color: getRandomColor() },
        { x: randomRange(10, canvas.width - 10), y: canvas.height - 10, vx: (Math.random() - 0.5) * 1, edge: 'bottom', color: getRandomColor() },
        { x: 10, y: randomRange(10, canvas.height - 10), vy: (Math.random() - 0.5) * 1, edge: 'left', color: getRandomColor() }
      ];
      nodes.push(...edgeNodes);
    }

    function getRandomColor() {
      const avoidColors = ["#000000", "#ff6302", "#0000ff"];
      let r, g, b, color;
      do {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
        color = `rgba(${r}, ${g}, ${b}, 0.5)`;
      } while (avoidColors.some(c => isColorClose(color, c)));
      return color;
    }

    function isColorClose(color1, color2) {
      const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
      const [r2, g2, b2] = color2.match(/#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i).slice(1).map(x => parseInt(x, 16));
      return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) < 100;
    }

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const allNodes = mouseNode ? [...nodes, mouseNode] : nodes;
      for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
          const dist = Math.hypot(allNodes[i].x - allNodes[j].x, allNodes[i].y - allNodes[j].y);
          if (dist < 100) {
            const gradient = ctx.createLinearGradient(allNodes[i].x, allNodes[i].y, allNodes[j].x, allNodes[j].y);
            gradient.addColorStop(0, allNodes[i].color.replace(/[\d.]+\)$/, "0.1)"));
            gradient.addColorStop(1, allNodes[j].color.replace(/[\d.]+\)$/, "0.1)"));
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + Math.sin(Date.now() / 500) * 0.5;
            ctx.beginPath();
            ctx.moveTo(allNodes[i].x, allNodes[i].y);
            ctx.lineTo(allNodes[j].x, allNodes[j].y);
            ctx.stroke();
          }
        }
      }
      allNodes.forEach(node => {
        const baseSize = 0.1 * Math.round(20*screenWidth / referenceWidth);
        const size = node.isMouse ? 6+2*baseSize : (node.edge ? 4+2*baseSize : 3+2*baseSize + Math.sin(Date.now() / 300) * 1);
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = node.isMouse ? 15 : 10;
        ctx.shadowColor = node.color.replace(/[\d.]+\)$/, "0.3)");
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    function updateNodes() {
      nodes.forEach(node => {
        if (node.edge) {
          if (node.edge === 'top' || node.edge === 'bottom') {
            node.x += node.vx;
            if (node.x < 10 || node.x > canvas.width - 10) node.vx *= -1;
          } else if (node.edge === 'left' || node.edge === 'right') {
            node.y += node.vy;
            if (node.y < 10 || node.y > canvas.height - 10) node.vy *= -1;
          }
        } else {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 10 || node.x > canvas.width - 10) node.vx *= -1;
          if (node.y < 10 || node.y > canvas.height - 10) node.vy *= -1;
        }
        if (Math.random() < 0.02) node.color = getRandomColor();
      });
    }

    card.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      if (canvasX >= 0 && canvasX <= canvas.width && canvasY >= 0 && canvasY <= canvas.height) {
        if (!mouseNode) {
          mouseNode = { x: canvasX, y: canvasY, color: 'rgba(255, 99, 2, 0.8)', isMouse: true };
        } else {
          mouseNode.x = canvasX;
          mouseNode.y = canvasY;
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      mouseNode = null;
    });

    function animate() {
      updateNodes();
      drawGrid();
      requestAnimationFrame(animate);
    }

    initializeNodes();
    animate();

    window.addEventListener("resize", () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initializeNodes();
      mouseNode = null;
    });