const admin = '간지용/16장';
var votelist = [];
var victory = [];
const alllist = "\u200b".repeat(500);
var count = null;
var winnercount;
function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName) {


if (msg.indexOf("!이벤트당첨자수") == 0) {
    if(sender!=admin){
        replier.reply('권한이 없어 거부되었습니다.');
            return;
    }
    else{
        winnercount = msg.substring(9);
        count = winnercount - 1;
        replier.reply("이벤트 당첨자 수 가 " + winnercount + "명이 되었습니다!");
    }
}
 
if (msg == "!이벤트참여") {
    if (votelist.indexOf(sender) != -1) {
        replier.reply(sender+,"이미 참여 완료 되었습니다.");
        } else {
            replier.reply("정상적으로 참여 완료되었습니다.");
            votelist.push(sender);
            }
            }
 
if (msg == "!이벤트참여자") {
    replier.reply("[이벤트 참여자 목록]"+alllist+'\n\n'+votelist.join('\n'));
    }
 
 
if (msg == "!이벤트추첨") {
    if(sender!=admin){
        replier.reply('권한이 없어 거부되었습니다.');
            return;
    }
    if(winnercount > votelist.length){
        replier.reply('참여자가 당첨자보다 적어 추첨할 수 없습니다. 참여자: '+votelist.length+'당첨자: '+winnercount);
            return;
    }
    victory = [];
    replier.reply("현재 참여자는 "+votelist.length+"명이며 총 당첨자는 "+winnercount+"입니다.");
    for (i = 1; victory.length <= count; i++) {
        var rule = Math.floor(Math.random() * votelist.length)|0;
        replier.reply("추첨번호: "+rule);
        if (victory.indexOf(votelist[rule]) != -1) {
            replier.reply("중복으로 재추첨: "+victory[rule]);
            return;
            }
        else {
            victory.push(votelist[rule]);
            }
    }
replier.reply("추첨이 완료되었습니다.");
}
if (msg == "!당첨자발표") {
    if (victory.length == 0){
        replier.reply("이벤트 추첨을 하지 않았습니다.");    
    }
    else{
    replier.reply("이벤트 당첨자 입니다."+alllist+'\n\n'+victory.join('\n'));
    replier.reply("참여자 및 당첨자 리스트를 초기화합니다.");
    victory = [];
    votelist = [];
    }
}

}