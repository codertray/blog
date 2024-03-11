function handleChange(event, form) {
    document.getElementById(form).action = '/blog/404';
    if (event.target.value !== '') {
        document.querySelector('.submit').disabled = true;
    } 
}
