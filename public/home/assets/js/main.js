const socket = io('http://localhost:3000');

socket.on("connect", () => {
    socket.on("send-message", data => {
        console.log(data);
        $('#content-chat').prepend(`<li class="msg-chat">
         <span class="msg-chat-name">${data.name} : </span>` + data.msg + `</li>`)
    })
})

const token = $('meta[name="csrf-token"]').attr('content')

$(document).ready(function () {
    $(document).on('click', '.fa-copy', function (e) {
        let copyText = $(e.target).prev();
        navigator.clipboard.writeText(copyText.text());
        Swal.fire({
            icon: 'success',
            title: `Sao chép ${copyText.text()} thành công`,
            showConfirmButton: false,
            timer: 1500
        })
    });

    $('.notify button').click(() => {
        $('#news').modal('show')

    })

    // Modal
    window.onload = function () {
        $('#news').modal('show')
    }

    // Diem danh
    $('#btn-diem-danh').click(function (e) {
        e.preventDefault();
        let phone = $('#diem_danh_phone').val();
        console.log(token);
        if (!phone) {
            return Swal.fire({
                icon: 'error',
                title: `Vui lòng nhập số điện thoại`,
                showConfirmButton: false,
                timer: 2000
            })
        }

        $('#btn-diem-danh').html('Đang kiểm tra').attr('disabled', true)
        $.ajax({
            url: '/pointList',
            headers: {
                'CSRF-Token': token
            },
            type: 'POST',
            data: {
                phone
            },
            success: function (res) {
                const { msg } = res
                if (res.status) {
                    setTimeout(() => {
                        $('#btn-diem-danh').html('Điểm danh').attr('disabled', false)
                        return Swal.fire({
                            icon: 'success',
                            title: msg,
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }, 1000);
                    $('#diem_danh_phone').val('');
                }
                else {
                    setTimeout(() => {
                        $('#btn-diem-danh').html('Điểm danh').attr('disabled', false)
                        return Swal.fire({
                            icon: 'error',
                            title: msg,
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }, 1000);
                }
            }
        });

    });

    $('#check-transaction').click(e => {
        e.preventDefault()
        const code = $('#code').val().trim()
        console.log(token);
        if (!code) {
            return Swal.fire({
                icon: 'error',
                title: `Vui lòng nhập mã giao dịch`,
                showConfirmButton: false,
                timer: 2000
            })
        }

        const urlApi = '/checkCode'

        $('#check-transaction').html('Đang kiểm tra').attr('disabled', true)

        $.ajax({
            url: urlApi,
            headers: {
                'CSRF-Token': token
            },
            method: 'POST',
            data: {
                code
            },
            success: function (res) {
                const { status, msg } = res

                if (status) {
                    setTimeout(() => {
                        $('#check-transaction').html('Kiểm tra').attr('disabled', false)
                        return Swal.fire({
                            icon: 'success',
                            title: msg,
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }, 3000);
                } else {
                    setTimeout(() => {
                        $('#check-transaction').html('Kiểm tra').attr('disabled', false)
                        return Swal.fire({
                            icon: 'error',
                            title: msg,
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }, 3000);
                }
            }
        })
    })

    $('.btn-chat').click(e => {
        e.preventDefault()
        const msgChat = $('#msg-chat').val().trim()
        const nameChat = localStorage.getItem('nameChat')
        const contentChat = $('#content-chat')
        if (!nameChat) {
            return Swal.fire({
                title: 'Nhập tên của bạn',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Ok',
                showLoaderOnConfirm: true,
                preConfirm: (name) => {
                    if (!name) {
                        return Swal.fire({
                            icon: 'error',
                            title: 'Vui lòng nhập tên của bạn',
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }
                }
            }).then((result) => {
                if(!result?.value.trim()) { 
                    return Swal.fire({
                        icon: 'error',
                        title: 'Vui lòng nhập tên của bạn',
                        showConfirmButton: false,
                        timer: 2000
                    })
                }
                if (result.isConfirmed && result.value) {
                    localStorage.setItem('nameChat', result.value)
                }
            })
        }
        if (msgChat && nameChat) {
            contentChat.prepend(`<li class="msg-chat">
            <span class="msg-chat-name">${nameChat} : </span>` + msgChat + `</li>`)
            $('#msg-chat').val('')
            socket.emit('send-message', {
                name: nameChat,
                msg: msgChat
            })
        }
    })
});