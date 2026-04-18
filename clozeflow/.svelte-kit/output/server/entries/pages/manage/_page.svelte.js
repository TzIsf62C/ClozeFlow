import { h as head, e as ensure_array_like, a as attr_class, f as stringify, d as escape_html, c as attr } from "../../../chunks/renderer.js";
import "papaparse";
import { D as DEFAULT_GRAM_CATS } from "../../../chunks/db.js";
const __vite_glob_0_0 = 'word,category,sentences\n"勇氣","Noun","在面對困難時，他展現了極大的(勇氣)去克服挑戰。|即使感到害怕，她依然鼓起(勇氣)站在台上演講。"\n"責任","Noun","照顧年邁的父母是子女應盡的(責任)。|身為組長，他必須為這次計畫的失敗負起全部的(責任)。"\n"效率","Noun","透過引進新的自動化設備，工廠的生產(效率)提升了一倍。|為了提高工作(效率)，我決定每天早上先列出待辦清單。"\n"傳統","Noun","每逢中秋節，吃月亮蝦餅並非台灣的(傳統)，吃月餅才是。|這座小鎮至今仍保留著許多古老的文化(傳統)。"\n"藉口","Noun","他總是為自己的遲到尋找各種(藉口)，讓人難以信任。|別再找(藉口)了，現在就開始行動吧。"\n"對手","Noun","他在這場棋賽中遇到了一個實力強勁的(對手)。|雖然在商場上是(對手)，但他們私下是非常好的朋友。"\n"環境","Noun","我們應該共同努力，為下一代創造一個更美好的生活(環境)。|適應新(環境)需要一段時間，請給自己多一點耐心。"\n"背景","Noun","這幅畫的(背景)是深藍色的星空，給人一種寧靜的感覺。|在錄取員工之前，公司會先調查應徵者的教育(背景)。"\n"趨勢","Noun","隨著科技的進步，遠端辦公已經成為全球的發展(趨勢)。|從目前的數據來看，房價仍有持續上漲的(趨勢)。"\n"資源","Noun","這間圖書館擁有豐富的圖書(資源)供民眾免費借閱。|水是地球上最寶貴的(資源)之一，我們應該節約使用。"\n"印象","Noun","這部電影感人的情節給我留下了深刻的(印象)。|第一次見面時，他對妳的(印象)非常好。"\n"負擔","Noun","高昂的學費對這個貧困的家庭來說是一項沉重的(負擔)。|規律的運動可以減輕心理上的(負擔)與壓力。"\n"規律","Noun","科學家試圖從混亂的數據中找出自然界的(規律)。|維持生活(規律)對於保持身體健康非常重要。"\n"成就","Noun","他在醫學領域的卓越(成就)獲得了國際間的肯定。|看到孩子平安長大，就是父母最大的(成就)。"\n"基礎","Noun","穩固的語言(基礎)是學習進階課程的關鍵。|這座大樓的(基礎)工程做得很紮實，能抵抗強震。"\n"魅力","Noun","那位演員極具個人(魅力)，吸引了無數粉絲。|這座城市的神祕(魅力)讓旅人流連忘返。"\n"矛盾","Noun","他的言行充滿了(矛盾)，讓人不知道該相信哪一句話。|理想與現實之間往往存在著難以調和的(矛盾)。"\n"規模","Noun","這家公司的經營(規模)逐年擴大，員工已達上千人。|這場地震的(規模)很大，全台都有明顯震感。"\n"動機","Noun","警方正在調查這起案件的犯罪(動機)。|缺乏學習(動機)是學生成績下滑的主要原因之一。"\n"尊嚴","Noun","每個人都有權利維護自己的(尊嚴)，不受他人羞辱。|他寧願辭職，也不願做出有損人格(尊嚴)的事情。"\nword,category,sentences\n"分析","Verb","專家正在(分析)市場數據，以預測未來的經濟走向。|透過仔細(分析)錯誤的原因，我們可以避免再次發生同樣的問題。"\n"改善","Verb","為了(改善)空氣品質，政府鼓勵民眾搭乘大眾運輸工具。|這款軟體經過多次更新，操作介面已經(改善)了許多。"\n"拒絕","Verb","他很有禮貌地(拒絕)了對方的邀請，因為那天他已經有約了。|即使面對高薪的誘惑，她依然(拒絕)做出違背良心的事。"\n"適應","Verb","剛搬到國外時，他花了好幾個月才(適應)當地的飲食習慣。|變色龍能隨環境改變體色，以(適應)周遭的色彩。"\n"延期","Verb","由於颱風來襲，原定於週六舉行的馬拉松比賽將(延期)舉行。|如果工作進度落後，我們可能不得不將截稿日期(延期)。"\n"累積","Verb","想要寫出一本好書，平時必須(累積)豐富的閱讀經驗。|他在這間公司工作了十年，(累積)了深厚的實務技巧。"\n"推薦","Verb","這家餐廳的招牌菜非常好吃，我強烈(推薦)你試試看。|老師向學校(推薦)了幾位表現優異的學生參加出國交換計畫。"\n"克服","Verb","只要我們團結一致，一定能(克服)目前面臨的種種困難。|他努力(克服)了對水的恐懼，終於學會了游泳。"\n"強調","Verb","醫生反覆(強調)睡眠充足對於免疫系統的重要性。|這篇報告特別(強調)了環境保護與經濟發展之間的平衡。"\n"購買","Verb","現在網路購物非常方便，隨時都能在線上(購買)所需的日常用品。|他(購買)了一張前往倫敦的機票，準備展開畢業旅行。"\n"猶豫","Verb","面對這兩個工作機會，他感到非常(猶豫)，不知道該如何選擇。|別再(猶豫)了，機會是不等人的，快點做決定吧。"\n"實施","Verb","新修訂的交通法規將於下個月正式(實施)。|公司決定從明年起(實施)彈性工時制度，以提高員工滿意度。"\n"觀察","Verb","學生們在實驗室裡仔細地(觀察)化學反應的過程。|透過長期(觀察)候鳥的遷徙路線，科學家掌握了牠們的習性。"\n"羡慕","Verb","他非常(羡慕)好友能擁有說走就走的勇氣。|大家都(羡慕)她能找到一份既有趣收入又高的工作。"\n"珍惜","Verb","我們應該(珍惜)身邊的親友，不要等到失去才後悔。|他非常(珍惜)這次出國深造的機會，每天都努力學習。"\n"忽略","Verb","在追求速度的同時，絕對不能(忽略)產品的品質控管。|他因為太忙於工作，(忽略)了對家人的陪伴與關心。"\n"貢獻","Verb","這位科學家一生致力於醫學研究，為人類做出了巨大(貢獻)。|每位國民都能為社會的進步(貢獻)一份心力。"\n"保證","Verb","廠商(保證)這台機器在正常使用情況下，三年內不會損壞。|我向你(保證)，我絕對會準時完成這項任務。"\n"威脅","Verb","氣候變遷正嚴重(威脅)著許多瀕危物種的生存。|那個陌生人恐嚇並(威脅)他交出身上的財物。"\n"推廣","Verb","政府近年來大力(推廣)資源回收，希望能減少垃圾量。|為了(推廣)閱讀文化，這間書店定期舉辦講座與讀書會。"\nword,category,sentences\n"謹慎","Adjective","這項實驗具有危險性，操作時必須非常(謹慎)。|他在理財方面一向很(謹慎)，從不投資自己不了解的產品。"\n"頻繁","Adjective","由於兩國貿易往來(頻繁)，雙方決定簽署新的合作協議。|最近這地區地震(頻繁)，請大家務必做好防震準備。"\n"罕見","Adjective","昨晚天空出現了(罕見)的極光現象，吸引了無數攝影師。|這種病例在醫學史上非常(罕見)，目前還沒有標準的治療方法。"\n"脆弱","Adjective","新生兒的免疫系統相對(脆弱)，需要細心的照料。|這件瓷器非常(脆弱)，搬運時請務必輕拿輕放。"\n"優秀","Adjective","他是一位非常(優秀)的領導者，深受同事們的愛戴。|這間學校培育出了許多(優秀)的工程師與科學家。"\n"盲目","Adjective","我們不應該(盲目)跟風購買流行服飾，而應該選擇適合自己的風格。|他在沒有做市場調查的情況下就(盲目)投資，結果損失慘重。"\n"奢侈","Adjective","對於忙碌的現代人來說，能安靜地讀一本書簡直是種(奢侈)。|他過著(奢侈)的生活，經常購買名貴的跑車和手錶。"\n"寂寞","Adjective","自從孩子出國讀書後，老王常感到生活很(寂寞)。|在這座陌生的城市裡，他感到前所未有的(寂寞)與孤獨。"\n"客觀","Adjective","作為一名記者，報導新聞時必須保持(客觀)的中立立場。|請針對這件事提供一些(客觀)的建議，不要夾雜個人情感。"\n"頑固","Adjective","他那(頑固)的脾氣讓家人都感到非常頭痛，沒人勸得動他。|儘管證據確鑿，他依然(頑固)地堅持自己沒有做錯。"\n"樂觀","Adjective","面對失敗，他始終保持(樂觀)的態度，相信下次會更好。|目前的經濟形勢不容(樂觀)，投資者應保持警覺。"\n"深刻","Adjective","那次旅行的經歷給我留下了極為(深刻)的印象。|這篇小說對人性進行了(深刻)的描寫，讀來令人動容。"\n"尷尬","Adjective","在派對上叫錯別人的名字是一件非常(尷尬)的事情。|當氣氛變得(尷尬)時，他試著講個笑話來緩和僵局。"\n"敏銳","Adjective","攝影師需要具備(敏銳)的觀察力，才能捕捉到動人的瞬間。|他對市場趨勢的觸覺非常(敏銳)，總能搶先發現商機。"\n"草率","Adjective","婚姻是一輩子的大事，絕對不能做出(草率)的決定。|由於準備過於(草率)，他的簡報在會上遭到了批評。"\n"迷人","Adjective","海邊的黃昏景色非常(迷人)，吸引了許多遊客駐足。|她擁有(迷人)的微笑，總能讓人感到心情愉悅。"\n"謙虛","Adjective","儘管獲得了巨大的成就，他依然保持(謙虛)的學習態度。|他表現得非常(謙虛)，總是把功勞歸功於團隊的努力。"\n"漫長","Adjective","經過(漫長)的等待，他終於收到了大學的錄取通知書。|在寒冷的北方，冬季總是顯得格外(漫長)且嚴酷。"\n"焦慮","Adjective","考試日期一天天逼近，他感到越來越(焦慮)。|長期處於(焦慮)的狀態會對身心健康造成不良影響。"\n"平凡","Adjective","他雖然只是一個(平凡)的上班族，卻擁有一個幸福美滿的家庭。|這部電影講述了一個(平凡)人如何成為英雄的感人故事。"\nword,category,sentences\n"刻意","Adverb","他今天(刻意)提早出門，就是為了避開上班尖峰時段的車潮。|這場意外看起來並不單純，警方懷疑有人(刻意)破壞了煞車系統。"\n"偶爾","Adverb","雖然他平時飲食很清淡，但(偶爾)還是會想吃點炸雞解饞。|我跟大學同學平時很少聯絡，只有在過年期間(偶爾)傳訊息問候。"\n"居然","Adverb","這題數學這麼簡單，你(居然)算錯了，真是太粗心了。|我找了這本書好幾個月，沒想到(居然)在自家的閣樓裡找到了。"\n"逐漸","Adverb","隨著天氣轉暖，山上的冰雪開始(逐漸)融化。|經過幾個月的練習，他的中文口說能力已經(逐漸)進步了。"\n"簡直","Adverb","這家餐廳的服務態度太差，(簡直)讓人無法忍受。|看到偶像出現在面前，她驚訝得(簡直)不敢相信自己的眼睛。"\n"竟然","Adverb","他平時看起來很健談，沒想到私底下(竟然)如此內向安靜。|這場球賽原本遙遙領先，最後(竟然)被對手逆轉勝了。"\n"稍微","Adverb","這道湯的味道淡了一點，如果能(稍微)加點鹽會更好喝。|請你在這裡(稍微)等一下，我進去拿個東西馬上就出來。"\n"特地","Adverb","聽說你生病了，我(特地)煮了雞湯送過來給你補補身體。|為了慶祝結婚紀念日，他(特地)預約了一間高檔的法式餐廳。"\n"依然","Adverb","儘管失敗了很多次，他(依然)不放棄，堅持要完成這個夢想。|十年沒見了，這座城市的美景(依然)和記憶中一模一樣。"\n"格外","Adverb","今晚的月色(格外)明亮，照得整個庭院如同白晝一般。|在寒冷的冬天裡，一碗熱騰騰的紅豆湯喝起來(格外)幸福。"\n"恰好","Adverb","我正想打電話找你，沒想到你就(恰好)走進辦公室了。|這件衣服的大小(恰好)合身，完全不需要修改長度。"\n"乾脆","Adverb","既然這台電腦修不好了，(乾脆)買一台性能更好的新電腦吧。|他這個人做事很(乾脆)，從不拖泥帶水，大家都很喜歡跟他合作。"\n"幸虧","Adverb","(幸虧)你及時提醒我，否則我就要錯過最後一班高鐵了。|出門前(幸虧)有帶傘，不然現在肯定會被這場大雨淋成落湯雞。"\n"難怪","Adverb","他這幾天都在熬夜趕報告，(難怪)今天看起來這麼疲倦。|原來他是職業運動員，(難怪)體能表現比一般人強這麼多。"\n"趕快","Adverb","快下雨了，我們(趕快)把晾在外面的衣服收進來吧。|如果你感覺身體不舒服，應該(趕快)去看醫生，不要硬撐。"\n"簡直","Adverb","那場地震的威力非常大，(簡直)要把整座城市都給震碎了。|這對雙胞胎長得一模一樣，(簡直)像從同一個模子印出來的。"\n"徹底","Adverb","搬家前，我們必須把舊房子裡的雜物(徹底)清理乾淨。|這次的失敗讓他(徹底)反省了自己的傲慢，變得謙虛許多。"\n"悄悄","Adverb","趁著大家都在午休，他(悄悄)地離開了座位，不驚動任何人。|春天已經(悄悄)地來到了人間，路邊的花朵都靜靜地盛開了。"\n"反覆","Adverb","老師在課堂上(反覆)說明這個文法要點，確保每位學生都聽懂。|他躺在床上(反覆)思考著明天的簡報內容，興奮得睡不著覺。"\n"特意","Adverb","為了給太太一個驚喜，他(特意)向公司請假去學校接孩子放學。|這幅畫是名家(特意)為這間飯店創作的，全世界僅此一幅。"';
const __vite_glob_0_1 = `word,category,sentences
"achieve","Verb","She finally (achieved) her goal of running a marathon after months of training.|With hard work, you can (achieve) anything you set your mind to."
"abandon","Verb","The sailors had to (abandon) the sinking ship in the middle of the storm.|The kitten was (abandoned) in a cardboard box on the street corner."
"accelerate","Verb","The driver (accelerated) to pass the slow truck on the highway.|Innovation in technology (accelerates) every year."
"accommodate","Verb","The new hotel can (accommodate) up to five hundred guests.|We will try our best to (accommodate) your special dietary requests."
"accumulate","Verb","Dust tends to (accumulate) quickly if you don't clean the shelves regularly.|He (accumulated) a massive collection of rare stamps over forty years."
"acknowledge","Verb","She (acknowledged) his presence with a brief nod across the room.|The government finally (acknowledged) that the policy had failed."
"acquire","Verb","The company (acquired) its smaller competitor to expand its market share.|It takes a long time to (acquire) fluency in a foreign language."
"adjust","Verb","You can (adjust) the height of the chair using the lever underneath.|It took her several weeks to (adjust) to the humid tropical climate."
"advocate","Verb","Many doctors (advocate) eating a balanced diet and exercising daily.|The group (advocates) for the rights of indigenous people."
"anticipate","Verb","We (anticipate) that the project will be finished by the end of next month.|The fans (anticipated) a victory, but the game ended in a draw."
"behave","Verb","The children (behaved) perfectly during the long wedding ceremony.|If you don't (behave), we will have to leave the restaurant immediately."
"calculate","Verb","Scientists (calculate) that the planet is billions of years old.|The accountant is (calculating) the total taxes owed for this quarter."
"characterize","Verb","High mountains and deep valleys (characterize) the landscape of this region.|His presidency was (characterized) by significant economic growth."
"coincide","Verb","The festival (coincides) with the first day of spring this year.|Our interests (coincide) perfectly, so we decided to start a business together."
"compensate","Verb","The company (compensated) the victims for the damage caused by the spill.|His intelligence more than (compensates) for his lack of experience."
"contribute","Verb","Everyone is expected to (contribute) ten dollars to the gift fund.|Stress often (contributes) to the development of physical illnesses."
"demonstrate","Verb","The chef (demonstrated) how to fillet a fish properly for the class.|The protesters (demonstrated) against the new laws in front of the capital."
"diminish","Verb","The sound of the sirens (diminished) as the ambulance drove further away.|We must not (diminish) the importance of his contributions to the project."
"eliminate","Verb","The team was (eliminated) from the tournament after losing the first round.|Adding insulation will help (eliminate) drafts in the house."
"exaggerate","Verb","Stop (exaggerating); the fish you caught wasn't actually that big!|The media often (exaggerates) the danger of traveling to that country."
"abundance","Noun","The tropical garden had an (abundance) of exotic flowers and fruits.|After the harvest, there was a great (abundance) of grain in the silos."
"ancestor","Noun","Her (ancestors) originally came from a small village in the mountains.|Scientists study fossils to learn about the (ancestors) of modern whales."
"appetite","Noun","Playing outside all day gave the children a massive (appetite).|He lost his (appetite) when he came down with a fever."
"boundary","Noun","The river forms a natural (boundary) between the two neighboring countries.|Personal (boundaries) are important for maintaining healthy relationships."
"clutter","Noun","I need to clear the (clutter) off my desk before I can start working.|Her attic was filled with years of (clutter) and old boxes."
"deterrent","Noun","A loud alarm system acts as a powerful (deterrent) for burglars.|The high price of the tickets served as a (deterrent) to many fans."
"efficiency","Noun","The new solar panels have increased the energy (efficiency) of the house.|She is known for her (efficiency) and ability to meet tight deadlines."
"fragrance","Noun","The sweet (fragrance) of blooming jasmine filled the evening air.|She chose a perfume with a light, floral (fragrance)."
"glimpse","Noun","I only caught a brief (glimpse) of the celebrity as she drove past.|He caught a (glimpse) of the ocean through the trees."
"hazard","Noun","Ice on the roads is a major (hazard) for drivers during the winter.|Toxic waste poses a significant (hazard) to the local environment."
"incentive","Noun","The company offered a cash (incentive) to employees who met their targets.|The tax break provided an (incentive) for people to buy electric cars."
"jeopardy","Noun","The captain's poor decisions put the entire crew in (jeopardy).|The future of the program is in (jeopardy) due to lack of funding."
"landlord","Noun","The (landlord) came by today to collect the monthly rent.|Our (landlord) promised to fix the leaking roof by Friday."
"milestone","Noun","Graduating from college is a significant (milestone) in a person's life.|The company reached a new (milestone) by selling its millionth product."
"obstacle","Noun","The fallen tree was a major (obstacle) in the middle of the path.|Language barriers can be a significant (obstacle) when traveling abroad."
"precaution","Noun","Wearing a seatbelt is a simple (precaution) that saves lives.|We took the (precaution) of locking all the windows before leaving."
"reputation","Noun","The restaurant has a global (reputation) for serving excellent seafood.|The scandal severely damaged the politician's (reputation)."
"shortage","Noun","The drought led to a severe water (shortage) across the state.|There is a (shortage) of skilled workers in the construction industry."
"traitor","Noun","The soldier was branded a (traitor) for giving secrets to the enemy.|He felt like a (traitor) for quitting the team right before the finals."
"verdict","Noun","The jury returned a guilty (verdict) after three days of deliberation.|Everyone waited breathlessly for the judge to read the final (verdict)."
"ambiguous","Adjective","The ending of the movie was (ambiguous), leaving the audience to guess what happened.|His (ambiguous) instructions led to several mistakes in the final report."
"belligerent","Adjective","The (belligerent) customer began shouting at the waiter for no reason.|The nation's (belligerent) attitude toward its neighbors worried the UN."
"conspicuous","Adjective","The red bird was (conspicuous) against the white snow.|He felt (conspicuous) standing in the middle of the room in his bright suit."
"diligent","Adjective","Thanks to her (diligent) research, she discovered a flaw in the original theory.|The (diligent) student spent every evening studying in the library."
"eloquent","Adjective","The president gave an (eloquent) speech that moved the entire nation to tears.|Her (eloquent) writing style makes even technical subjects easy to read."
"frivolous","Adjective","The judge dismissed the (frivolous) lawsuit for lack of any real evidence.|She regretted spending her savings on (frivolous) purchases like designer shoes."
"gregarious","Adjective","Being a (gregarious) person, he was always the life of the party.|The (gregarious) nature of dolphins makes them popular with researchers."
"haphazard","Adjective","The books were stacked in a (haphazard) pile that looked ready to collapse.|The city grew in a (haphazard) way without any formal urban planning."
"impeccable","Adjective","She speaks French with (impeccable) grammar and a perfect accent.|The service at the five-star hotel was absolutely (impeccable)."
"jubilant","Adjective","The (jubilant) crowd cheered as the team scored the winning goal.|She felt (jubilant) after receiving the news that she got the job."
"lethargic","Adjective","The hot summer weather made everyone feel (lethargic) and tired.|He felt (lethargic) for several days after recovering from the flu."
"meticulous","Adjective","The surgeon was (meticulous) in ensuring every detail of the procedure was perfect.|He is (meticulous) about keeping his tools organized and clean."
"notorious","Adjective","The intersection is (notorious) for having a high number of accidents.|He was (notorious) for losing his temper during board meetings."
"obsolete","Adjective","Floppy disks became (obsolete) once USB drives were introduced.|The factory was forced to close because its machinery was (obsolete)."
"precarious","Adjective","The ladder was in a (precarious) position and looked like it might fall.|The hikers found themselves in a (precarious) spot on the edge of the cliff."
"resilient","Adjective","Children are often more (resilient) than adults when facing major changes.|The (resilient) fabric regained its shape even after being stretched."
"scrupulous","Adjective","The lawyer was (scrupulous) about following every detail of the law.|A (scrupulous) researcher always double-checks their data before publishing."
"trivial","Adjective","Don't waste your time worrying about (trivial) matters that don't affect the outcome.|The difference in price between the two items was (trivial)."
"unanimous","Adjective","The board reached a (unanimous) decision to approve the merger.|The critics were (unanimous) in their praise for the new play."
"versatile","Adjective","This (versatile) tool can be used for cutting, sanding, and drilling.|She is a (versatile) actress who can play both comedic and tragic roles."
"abruptly","Adverb","The music stopped (abruptly), leaving the room in a sudden, awkward silence.|The driver slammed on the brakes when a cat (abruptly) ran into the street."
"anonymously","Adverb","The billionaire (anonymously) donated millions of dollars to the local hospital.|The whistleblower leaked the documents (anonymously) to protect their identity."
"clumsily","Adverb","He (clumsily) tripped over the rug and spilled coffee all over the sofa.|The toddler (clumsily) tried to tie his own shoes for the first time."
"consequently","Adverb","The team lost their star player; (consequently), they struggled for the rest of the season.|She forgot to set her alarm and (consequently) missed the morning flight."
"deliberately","Adverb","The detective believed the fire was (deliberately) set to hide evidence.|She (deliberately) ignored his messages because she was still angry with him."
"eagerly","Adverb","The children (eagerly) gathered around the tree to open their presents.|The fans (eagerly) awaited the release of the band's new album."
"excessively","Adverb","The engine was (excessively) loud, indicating a major mechanical problem.|He was (excessively) worried about the exam despite being the top student."
"frantically","Adverb","She searched (frantically) for her keys as she was already late for the meeting.|The lifeguards swam (frantically) toward the person struggling in the waves."
"grudgingly","Adverb","He (grudgingly) admitted that his younger brother was better at chess.|After a long debate, she (grudgingly) agreed to help with the chores."
"hastily","Adverb","He (hastily) packed his suitcase and rushed to the airport.|The note was (hastily) written on a scrap of paper and was hard to read."
"inadvertently","Adverb","I (inadvertently) deleted the file while trying to rename it.|She (inadvertently) offended him by making a joke about his favorite hobby."
"invariably","Adverb","Whenever I forget my umbrella, it (invariably) rains in the afternoon.|High-quality products (invariably) cost more than cheap imitations."
"meticulously","Adverb","The crime scene was (meticulously) searched for even the smallest clues.|She (meticulously) planned every detail of the wedding six months in advance."
"notoriously","Adverb","The city's traffic is (notoriously) bad during the Monday morning rush.|The actor is (notoriously) difficult to work with on a movie set."
"precariously","Adverb","The vase was balanced (precariously) on the edge of the narrow shelf.|The mountain climber hung (precariously) from a rope high above the valley."
"reluctantly","Adverb","The child (reluctantly) ate his broccoli after being promised dessert.|She (reluctantly) sold her vintage car because she needed the money."
"seamlessly","Adverb","The new software integrates (seamlessly) with your existing operating system.|The transition from the old manager to the new one went (seamlessly)."
"spontaneously","Adverb","The audience (spontaneously) burst into applause at the end of the song.|We decided (spontaneously) to go on a road trip over the weekend."
"tentatively","Adverb","The kitten (tentatively) stepped out of the carrier to explore the new room.|The meeting has been (tentatively) scheduled for next Tuesday at noon."
"vigorously","Adverb","You need to shake the bottle (vigorously) before pouring the juice.|He (vigorously) denied the accusations during the press conference."`;
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "manual";
    let words = [];
    let manualWord = "";
    let manualCat = DEFAULT_GRAM_CATS[0];
    let manualSentences = [""];
    let isSaving = false;
    let allCats = [...DEFAULT_GRAM_CATS];
    const sampleGlob = /* @__PURE__ */ Object.assign({ "/static/samples/Chinese_Traditional.csv": __vite_glob_0_0, "/static/samples/English.csv": __vite_glob_0_1 });
    Object.entries(sampleGlob).map(([path, content]) => {
      const filename = path.split("/").pop();
      const name = filename.replace(/\.csv$/i, "").replace(/_/g, " ");
      return { name, content, filename };
    });
    head("1s1mgsk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>ClozeFlow — Manage</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-lg px-4 pt-6"><h1 class="mb-6 text-2xl font-bold text-gray-900">Manage Words</h1> <div class="mb-6 flex rounded-xl bg-gray-100 p-1"><!--[-->`);
    const each_array = ensure_array_like([
      { id: "manual", label: "Manual Entry" },
      { id: "csv", label: "CSV Upload" },
      { id: "samples", label: "Samples" }
    ]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class(` tap-target flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${stringify(activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700")} `)}>${escape_html(tab.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><form class="space-y-4"><div><label for="word-input" class="mb-1 block text-sm font-medium text-gray-700">Vocabulary Word</label> <input id="word-input" type="text"${attr("value", manualWord)} placeholder="e.g. run" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/></div> <div><label${attr("for", "cat-select")} class="mb-1 block text-sm font-medium text-gray-700">Category</label> `);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.select(
          {
            id: "cat-select",
            value: manualCat,
            class: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          },
          ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(allCats);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let cat = each_array_1[$$index_1];
              $$renderer3.option({ value: cat }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(cat)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(` <button type="button" class="mt-1.5 text-sm text-blue-600 hover:underline">+ Add custom category</button>`);
      }
      $$renderer2.push(`<!--]--></div> <fieldset><legend class="mb-1 block text-sm font-medium text-gray-700">Example Sentences</legend> <p class="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Wrap the target word (or its contextual form) in <strong>parentheses</strong> to mark the blank. <span class="font-mono">She finally (achieved) her goal.</span></p> <div class="space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(manualSentences);
      for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
        each_array_2[idx];
        $$renderer2.push(`<div class="flex gap-2"><textarea placeholder="e.g. She finally (achieved) her goal after months of training." rows="2" class="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">`);
        const $$body = escape_html(manualSentences[idx]);
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea> `);
        if (manualSentences.length > 1) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="tap-target self-start rounded-xl border border-gray-200 px-3 py-2 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500">✕</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> <button type="button" class="mt-2 text-sm text-blue-600 hover:underline">+ Add another sentence</button></fieldset> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button type="submit"${attr("disabled", isSaving, true)} class="tap-target w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">${escape_html("Save Word")}</button></form></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="mb-10 mt-8"><h2 class="mb-4 text-base font-semibold text-gray-700">Saved Words `);
    if (words.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="ml-1 text-gray-400">(${escape_html(words.length)})</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></h2> `);
    if (words.length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">No words yet. Add some above!</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_4 = ensure_array_like(words);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let word = each_array_4[$$index_4];
        $$renderer2.push(`<div class="flex items-start justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="font-semibold text-gray-900">${escape_html(word.word)}</span> <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">${escape_html(word.gramCat)}</span></div> <p class="mt-0.5 truncate text-xs text-gray-400">${escape_html(word.sentences.length)} sentence${escape_html(word.sentences.length !== 1 ? "s" : "")}</p></div> <button class="tap-target flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Delete word">🗑</button></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
