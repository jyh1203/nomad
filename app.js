const title = document.querySelector("div.hello h1");
const {TextEncoder} = require('text-encoding');


console.dir(title);


function handleTitleClick(){
    console.log("title was clicked!");
    title.style.color = "blue"

}

function handleMouseEnter(){
    const decodedString = "example가나다";
    const encoder = new TextEncoder('euc-kr');
    const encoded = encoder.encode(decodedString);
    console.log(encoded);
}
function handleMouseLeave(){
    console.log("Mouse is Leave!")
    title.innerText = "Got you!";
}

title.addEventListener("click", handleTitleClick);
title.addEventListener("mouseenter", handleMouseEnter);
title.addEventListener("mouseleave", handleMouseLeave);


package com.tistory.needneo;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;

public class Main {

    public static void main(String[] args) throws UnsupportedEncodingException {
        String val = "테스트문자열";
        String encodeVal = "";
        String decodeVal = "";

        encodeVal = URLEncoder.encode(val, "utf-8");
		decodeVal = URLDecoder.decode(encodeVal, "utf-8");

        System.out.println("인코딩=>" + encodeVal);
        System.out.println("디코딩=>" + decodeVal);
    }
}