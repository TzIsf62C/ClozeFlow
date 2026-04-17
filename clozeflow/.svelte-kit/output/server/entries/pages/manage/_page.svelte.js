import { h as head, e as ensure_array_like, a as attr_class, f as stringify, d as escape_html, c as attr } from "../../../chunks/renderer.js";
import "papaparse";
import { D as DEFAULT_GRAM_CATS } from "../../../chunks/db.js";
const __vite_glob_0_0 = 'word,category,sentences\n"美麗","Adjective","這片風景非常美麗，吸引了無數遊客前來拍照留念。|她穿著一件美麗的禮服出現在舞會上，每個人都讚不絕口。"\n"寒冷","Adjective","冬天的北方非常寒冷，氣溫經常降到零下二十度。|如果不穿厚外套，在這麼寒冷的天氣裡很容易感冒。"\n"昂貴","Adjective","這隻名牌手錶價格極其昂貴，普通人根本負擔不起。|這家餐廳的菜餚雖然美味，但價格實在太昂貴了。"\n"誠實","Adjective","他是一個誠實的人，從來不說謊或欺騙朋友。|唯有誠實的面對錯誤，才能贏得別人的原諒與信任。"\n"狹窄","Adjective","這條小巷子非常狹窄，連一輛小轎車都難以通過。|老舊公寓的走廊十分狹窄，兩個人並肩走都很困難。"\n"勤奮","Adjective","他工作非常勤奮，每天都是公司裡最早到最晚走的人。|只要你足夠勤奮，在學業上一定能取得優異的成績。"\n"巨大","Adjective","這座雕像規模巨大，遠在幾公里外就能清晰看見。|科學家在深海中發現了一隻體型巨大的未知生物。"\n"安靜","Adjective","圖書館裡非常安靜，只聽得到翻書與寫字的聲音。|深夜的小鎮顯得格外安靜，沒有任何車輛經過的嘈雜聲。"\n"勇敢","Adjective","那位勇敢的消防員衝進火場，救出了受困的小孩。|面對困難時，我們需要有勇敢的心去挑戰並克服它。"\n"憤怒","Adjective","看到辛辛苦苦完成的作品被破壞，他感到非常憤怒。|他因為受到不公平的對待而露出了憤怒的表情。"\n"潮濕","Adjective","梅雨季節的空氣非常潮濕，衣服晾了好幾天都不會乾。|這間地下室既陰暗又潮濕，牆角甚至都長出了黴菌。"\n"聰明","Adjective","這個孩子非常聰明，簡單的數學題看一眼就知道答案。|她利用聰明的才智，成功解決了公司面臨的重大危機。"\n"枯燥","Adjective","這場演講的內容十分枯燥，台下的聽眾都快睡著了。|每天重複同樣的工作讓他覺得生活變得非常枯燥乏味。"\n"溫柔","Adjective","護士小姐說話的聲音非常溫柔，讓病人的心情放鬆不少。|她對待流浪貓總是特別溫柔，會輕聲細語地跟牠們說話。"\n"茂密","Adjective","這片原始森林裡有著茂密的植被，陽光幾乎照不進來。|夏天的這棵大樹長得非常茂密，提供了一個涼爽的遮蔭處。"\n"慷慨","Adjective","這位企業家非常慷慨，每年都會捐出大筆資金幫助窮人。|他對待朋友一向很慷慨，總是主動請客且從不計較金錢。"\n"敏捷","Adjective","貓的身手非常敏捷，能輕易地跳上高牆並捕捉獵物。|足球守門員必須擁有敏捷的反應，才能擋住飛速而來的球。"\n"混亂","Adjective","車禍發生後，現場交通陷入一片混難，警察正忙著指揮。|這間臥室非常混亂，地上到處都是隨意丟棄的衣服和書本。"\n"謙虛","Adjective","儘管他獲得了最高榮譽，但他依然保持謙虛，從不炫耀。|一個謙虛的人往往能虛心接受他人的建議，進而不斷進步。"\n"脆弱","Adjective","這件古董瓷器非常脆弱，搬運時必須格外小心。|她在剛失戀時心靈非常脆弱，需要朋友長時間的陪伴。"\n"學習","Verb","他每天花三小時學習韓語，希望能流利對話。|終身學習是保持頭腦靈活的最佳方法。"\n"跑步","Verb","為了參加馬拉松，他每天清晨都會去公園跑步。|他在操場上跑步，汗水浸透了整件運動衫。"\n"烹飪","Verb","她非常喜歡烹飪，總能用簡單的食材做出五星級的料理。|他在廚房烹飪晚餐時，屋子裡充滿了迷人的香味。"\n"閱讀","Verb","在安靜的圖書館裡，他正專心地閱讀一本歷史小說。|多閱讀可以增廣見聞，並豐富我們的詞彙量。"\n"游泳","Verb","夏天天氣炎熱，許多小朋友喜歡到海邊游泳消暑。|他像魚兒一樣在水裡自在地游泳，泳速非常快。"\n"駕駛","Verb","在取得執照之前，你必須先學會如何安全地駕駛汽車。|他在高速公路上小心地駕駛，時刻注意後方來車。"\n"修理","Verb","水龍頭漏水了，爸爸正拿著工具箱準備修理。|這台電腦壞了很久，技師終於把它修理好了。"\n"慶祝","Verb","全家人聚在一起，共同慶祝奶奶的八十歲大壽。|贏得比賽後，球員們開香檳大聲歡呼來慶祝勝利。"\n"溝通","Verb","兩國領導人決定透過對話來溝通，以解決長久以來的糾紛。|良好的溝通是建立穩定人際關係的基石。"\n"拒絕","Verb","雖然對方的條件很誘人，但他還是堅定地拒絕了這項提議。|他因為太忙而不得不拒絕了朋友的聚會邀請。"\n"考慮","Verb","這是一項重大的決定，請給我幾天的時間仔細考慮。|在買房之前，你必須考慮到交通、機能與預算問題。"\n"保護","Verb","為了保護環境，我們應該減少使用一次性塑膠產品。|這層特殊的塗料可以保護木頭不受潮濕天氣的侵蝕。"\n"解釋","Verb","老師正在黑板上畫圖，試圖向學生解釋地心引力的原理。|你能解釋一下為什麼你今天開會遲到了嗎？"\n"觀察","Verb","科學家在野外長時間觀察鳥類的遷徙習慣。|透過顯微鏡觀察，我們可以看到細胞的微觀結構。"\n"打掃","Verb","過年前，全家人會一起大掃除，把家裡打掃得一塵不染。|下課後，學生們輪流留在教室打掃衛生。"\n"創造","Verb","這位藝術家用廢棄的金屬創造出一件令人驚嘆的雕塑作品。|科技的進步為人類創造了更便利的生活方式。"\n"等待","Verb","他在火車站的長椅上焦急地等待，期待見到多年不見的好友。|好機會值得耐心等待，不要因為一時衝動而放棄。"\n"討論","Verb","我們針對明年的行銷計畫進行了深入的討論。|同學們圍坐在一起討論老師剛才提出的問題。"\n"練習","Verb","想要彈好鋼琴，唯一的捷徑就是不斷地練習。|他在家裡對著鏡子練習演講，調整自己的表情與語氣。"\n"忘記","Verb","他出門太匆忙，竟然忘記帶錢包和鑰匙。|時間會讓人忘記痛苦，但珍貴的回憶永遠都在。"\n"在","Adposition","他現在正坐在椅子上看書，一動也不動。|那本書就在桌子上面，你自己去拿。"\n"從","Adposition","我們打算從臺北搭火車去花蓮旅遊。|這段引文是從那本著名的古典小說中節錄出來的。"\n"到","Adposition","這班公車會直接開到市中心，中途不停靠。|他每天從早忙到晚，幾乎沒有休息的時間。"\n"對","Adposition","多吃蔬菜對身體健康非常有幫助。|他對這件突發事件的反應感到非常驚訝。"\n"向","Adposition","請你向左轉，走到底就會看到那家書店了。|他誠懇地向老師請教關於未來職涯發展的問題。"\n"往","Adposition","沿著這條路一直往北走，你就會看到火車站。|這班飛機是往美國舊金山的，請旅客準時登機。"\n"離","Adposition","我家離學校很近，走路只要五分鐘就到了。|他現在所在的位置離終點線只剩下一百公尺。"\n"自","Adposition","這份禮物是自遠方寄來的，充滿了朋友的心意。|他自幼就對天文學感興趣，夢想成為宇航員。"\n"朝","Adposition","他朝著太陽升起的方向跑去，迎接新的一天。|請朝這張紙的中心點看，你會發現隱藏的圖案。"\n"跟","Adposition","我明天想跟朋友一起去電影院看最新上映的大片。|他跟弟弟長得非常像，外人很難分辨出來。"\n"與","Adposition","這項政策與民眾的生活息息相關，必須謹慎處理。|他與家人在公園散步，享受溫暖的午後陽光。"\n"由","Adposition","這場音樂會將由著名的指揮家帶領樂團演出。|這個提案是由委員會經過多方討論後決定的。"\n"關於","Adposition","這本雜誌裡有許多關於環境保護的專題報導。|關於這項計畫的預算，我們還需要再進一步核算。"\n"至於","Adposition","主菜我已經準備好了，至於甜點就交給你負責。|他很喜歡這支手機的設計，至於價格則在考慮範圍內。"\n"除了","Adposition","除了蘋果以外，他什麼水果都不喜歡吃。|今天除了小明請假，其他同學都準時出席了。"\n"為了","Adposition","為了能考上理想的大學，他每天都讀書到深夜。|他努力工作是為了給家人提供更好的生活環境。"\n"依據","Adposition","法官會依據法律事實來做出最終的判決。|我們依據實驗結果得出結論，證明這個假設是正確的。"\n"經過","Adposition","經過長時間的努力，他終於實現了創業的夢想。|經過那家店門口時，我被櫥窗裡的精美手錶吸引了。"\n"沿著","Adposition","沿著這條河邊的小徑散步，風景非常優美。|你只要沿著黃色實線走，就能找到展覽廳的出口。"\n"隨著","Adposition","隨著氣溫升高，冰淇淋的銷量也跟著大幅增加。|隨著年齡的增長，他變得越來越成熟穩重了。"';
const __vite_glob_0_1 = `word,category,sentences
"gregarious","Adjective","Because he is so gregarious, he is always the life of the party and makes friends with everyone in the room.|The gregarious neighbor hosted weekly block parties and invited every family on the street."
"diligent","Adjective","The diligent student stayed late every night to ensure her research paper was flawless.|He is a diligent worker who never leaves a task unfinished or overlooks a minor detail."
"fragile","Adjective","The museum marked the ancient vase as fragile to ensure visitors wouldn't touch and break it.|After the surgery, his health remained fragile, requiring constant care and a very quiet environment."
"spacious","Adjective","The new apartment was so spacious that they had plenty of room for a grand piano and a large dining table.|We chose the spacious SUV because it could comfortably fit seven passengers and all of our camping gear."
"vibrant","Adjective","The sunset was filled with vibrant hues of deep orange, hot pink, and brilliant purple.|She has a vibrant personality that lights up the room and makes everyone feel energized."
"obsolete","Adjective","Typewriters became obsolete once personal computers and word processors became affordable for every household.|The factory was filled with obsolete machinery that was no longer efficient enough for modern production."
"tedious","Adjective","Filling out hundreds of insurance forms by hand is a tedious task that takes hours of concentration.|The lecture was so tedious and repetitive that half the students were struggling to stay awake."
"versatile","Adjective","A pocket knife is a versatile tool that can be used for cutting, opening cans, or even tightening screws.|The actor is incredibly versatile, moving effortlessly from slapstick comedy to intense dramatic roles."
"cluttered","Adjective","The desk was so cluttered with old papers, coffee mugs, and pens that there was no room for the laptop.|Her mind felt cluttered with worries, making it difficult for her to focus on a single task."
"transparent","Adjective","The water in the tropical lagoon was so transparent that we could see the colorful fish swimming three meters below.|His excuses were completely transparent, and everyone knew the real reason he was late for work."
"sturdy","Adjective","We need a sturdy ladder that won't wobble when I climb up to clean the gutters.|The old oak table is so sturdy that it has survived three generations of rowdy family dinners."
"ambiguous","Adjective","The ending of the movie was intentionally ambiguous, leaving the audience to debate whether the hero survived.|The instructions were too ambiguous, leading to several different interpretations by the assembly team."
"delicious","Adjective","The chef prepared a delicious five-course meal that left every guest craving more.|The aroma of delicious freshly baked bread wafted from the bakery and drew a crowd onto the sidewalk."
"hazardous","Adjective","Working with high-voltage electricity is a hazardous job that requires strict adherence to safety protocols.|The icy roads created hazardous driving conditions, leading to several accidents on the highway."
"meticulous","Adjective","The jeweler was meticulous, spending hours examining the diamond for even the smallest imperfection.|Her meticulous planning ensured that every detail of the wedding went off without a single hitch."
"redundant","Adjective","The phrase 'ATM machine' is redundant because the 'M' already stands for 'machine.'|The backup generator became redundant once the city installed a more reliable power grid."
"tranquil","Adjective","The spa provided a tranquil environment with soft music and the gentle sound of flowing water.|We spent a tranquil afternoon sitting by the lake, watching the dragonflies hover over the still surface."
"fragrant","Adjective","The garden was filled with fragrant lilies that perfumed the air every evening.|She brewed a pot of fragrant jasmine tea that filled the kitchen with a floral aroma."
"vivid","Adjective","I had such a vivid dream last night that I could still smell the salt air when I woke up.|The witness provided a vivid description of the suspect, including the exact color of his eyes."
"unanimous","Adjective","The jury reached a unanimous verdict, with all twelve members agreeing that the defendant was innocent.|The board of directors was unanimous in their decision to appoint the new CEO immediately."
"gregarious","Adjective","Because he is so gregarious, he is always the life of the party and makes friends with everyone in the room.|The gregarious neighbor hosted weekly block parties and invited every family on the street."
"diligent","Adjective","The diligent student stayed late every night to ensure her research paper was flawless.|He is a diligent worker who never leaves a task unfinished or overlooks a minor detail."
"fragile","Adjective","The museum marked the ancient vase as fragile to ensure visitors wouldn't touch and break it.|After the surgery, his health remained fragile, requiring constant care and a very quiet environment."
"spacious","Adjective","The new apartment was so spacious that they had plenty of room for a grand piano and a large dining table.|We chose the spacious SUV because it could comfortably fit seven passengers and all of our camping gear."
"vibrant","Adjective","The sunset was filled with vibrant hues of deep orange, hot pink, and brilliant purple.|She has a vibrant personality that lights up the room and makes everyone feel energized."
"obsolete","Adjective","Typewriters became obsolete once personal computers and word processors became affordable for every household.|The factory was filled with obsolete machinery that was no longer efficient enough for modern production."
"tedious","Adjective","Filling out hundreds of insurance forms by hand is a tedious task that takes hours of concentration.|The lecture was so tedious and repetitive that half the students were struggling to stay awake."
"versatile","Adjective","A pocket knife is a versatile tool that can be used for cutting, opening cans, or even tightening screws.|The actor is incredibly versatile, moving effortlessly from slapstick comedy to intense dramatic roles."
"cluttered","Adjective","The desk was so cluttered with old papers, coffee mugs, and pens that there was no room for the laptop.|Her mind felt cluttered with worries, making it difficult for her to focus on a single task."
"transparent","Adjective","The water in the tropical lagoon was so transparent that we could see the colorful fish swimming three meters below.|His excuses were completely transparent, and everyone knew the real reason he was late for work."
"sturdy","Adjective","We need a sturdy ladder that won't wobble when I climb up to clean the gutters.|The old oak table is so sturdy that it has survived three generations of rowdy family dinners."
"ambiguous","Adjective","The ending of the movie was intentionally ambiguous, leaving the audience to debate whether the hero survived.|The instructions were too ambiguous, leading to several different interpretations by the assembly team."
"delicious","Adjective","The chef prepared a delicious five-course meal that left every guest craving more.|The aroma of delicious freshly baked bread wafted from the bakery and drew a crowd onto the sidewalk."
"hazardous","Adjective","Working with high-voltage electricity is a hazardous job that requires strict adherence to safety protocols.|The icy roads created hazardous driving conditions, leading to several accidents on the highway."
"meticulous","Adjective","The jeweler was meticulous, spending hours examining the diamond for even the smallest imperfection.|Her meticulous planning ensured that every detail of the wedding went off without a single hitch."
"redundant","Adjective","The phrase 'ATM machine' is redundant because the 'M' already stands for 'machine.'|The backup generator became redundant once the city installed a more reliable power grid."
"tranquil","Adjective","The spa provided a tranquil environment with soft music and the gentle sound of flowing water.|We spent a tranquil afternoon sitting by the lake, watching the dragonflies hover over the still surface."
"fragrant","Adjective","The garden was filled with fragrant lilies that perfumed the air every evening.|She brewed a pot of fragrant jasmine tea that filled the kitchen with a floral aroma."
"vivid","Adjective","I had such a vivid dream last night that I could still smell the salt air when I woke up.|The witness provided a vivid description of the suspect, including the exact color of his eyes."
"unanimous","Adjective","The jury reached a unanimous verdict, with all twelve members agreeing that the defendant was innocent.|The board of directors was unanimous in their decision to appoint the new CEO immediately."
"everyone","Pronoun","The room fell silent because **everyone** was waiting for the guest of honor to arrive.|It is a secret that **everyone** in the small town seems to know except for me."
"themselves","Pronoun","After the long hike, the scouts built a campfire and cooked dinner for **themselves**.|The children are old enough to wash the dishes and clean the playroom by **themselves**."
"anybody","Pronoun","The house was so quiet that I didn't think there was **anybody** home.|Is there **anybody** in the office who knows how to fix the paper jam in the copier?"
"whose","Pronoun","That is the neighbor **whose** dog barks loudly at the mailman every single morning.|I found a set of keys on the sidewalk, but I have no idea **whose** they are."
"each","Pronoun","There were ten contestants, and **each** was given a unique number to wear during the race.|The twins are very different; **each** has his own distinct personality and set of hobbies."
"something","Pronoun","I can smell **something** burning in the kitchen, so please check the oven immediately.|She felt **something** crawl across her foot while she was walking through the tall grass."
"which","Pronoun","We have two options for dinner, so you need to decide **which** you would prefer.|The blue coat, **which** belonged to my grandfather, is still in excellent condition."
"none","Pronoun","I looked for my keys everywhere, but **none** of the usual spots yielded any results.|Of all the cakes entered in the baking contest, **none** tasted better than the chocolate one."
"whoever","Pronoun","**Whoever** left the window open last night should be responsible for cleaning up the rain puddles.|The prize will be awarded to **whoever** crosses the finish line in the shortest amount of time."
"everything","Pronoun","He lost his luggage at the airport, so he had to go out and buy **everything** from scratch.|She was so organized that **everything** in her toolbox was labeled and in its proper place."
"somebody","Pronoun","I heard a knock at the door, so there must be **somebody** outside waiting to come in.|Can **somebody** please help me carry these heavy boxes up to the third floor?"
"itself","Pronoun","The modern security system is so advanced that it can actually reset **itself** after a power outage.|The cat spent the entire afternoon grooming **itself** while sitting on the sunny windowsill."
"those","Pronoun","**Those** are the shoes I want to buy, but they are currently out of stock in my size.|The cookies on the top shelf are for the party, so please don't eat **those** yet."
"another","Pronoun","This cup of coffee is cold; would you mind bringing me **another** one that is fresh?|I've finished reading this book, so I'm going to the library to find **another**."
"few","Pronoun","Many people applied for the executive position, but only a **few** were chosen for an interview.|Most of the apples were bruised, but I managed to find a **few** that were still crisp."
"whom","Pronoun","The woman to **whom** you were speaking earlier is the director of the local hospital.|He is the candidate for **whom** I decided to cast my vote during the last election."
"nothing","Pronoun","The fridge was completely empty, so there was **nothing** to eat for breakfast this morning.|He looked disappointed, but he said **nothing** when the teacher announced the test results."
"neither","Pronoun","I offered him tea or coffee, but he wanted **neither** and asked for a glass of water.|Both shirts are expensive, and unfortunately, **neither** fits me quite right."
"ourselves","Pronoun","We don't need a professional painter because we can easily paint the living room **ourselves**.|We should be proud of **ourselves** for finishing the marathon in under four hours."
"whatever","Pronoun","You can choose **whatever** you want from the menu, and I will pay for the meal.|I will follow your lead and do **whatever** is necessary to make this project a success."
"architecture","Noun","The city is famous for its Gothic architecture, characterized by pointed arches and stone gargoyles.|He decided to study architecture because he loved designing complex structures and drafting blueprints."
"hypothesis","Noun","The scientist formed a hypothesis to explain why the plants grew faster in red light than in blue light.|After conducting the experiment, the data proved that her original hypothesis was incorrect."
"monarchy","Noun","The country transitioned from an absolute monarchy to a democracy where the people elect their leaders.|The king is the head of the monarchy, but he holds very little actual political power today."
"adversary","Noun","In the final round of the tournament, he had to face his toughest adversary yet.|Though they were friends in private, they were fierce adversaries on the floor of the senate."
"component","Noun","The engineer explained that every small component in the engine must function perfectly for the car to run.|Nitrogen is a major component of the Earth's atmosphere, making up about seventy-eight percent of the air."
"drought","Noun","The farmers lost their entire corn crop this year due to a severe drought that lasted all summer.|The reservoir reached record low levels because there was no rainfall during the long drought."
"equilibrium","Noun","The gymnast moved her arms slightly to maintain her equilibrium while walking across the narrow balance beam.|In economics, a market reaches equilibrium when the supply of a product matches the consumer demand."
"nostalgia","Noun","Listening to the songs from his childhood filled him with a deep sense of nostalgia for his old hometown.|The vintage decor in the diner was designed to evoke nostalgia for the nineteen-fifties."
"receptionist","Noun","The receptionist at the front desk asked me to sign in and wait a few minutes for my appointment.|If you have any questions upon entering the building, the receptionist can give you a visitor's badge."
"scarcity","Noun","The scarcity of clean water in the desert makes it the most valuable resource for any traveler.|Due to the scarcity of rare earth minerals, the price of high-end electronics has risen sharply."
"utensil","Noun","A spatula is a very useful kitchen utensil for flipping pancakes or scraping batter out of a bowl.|The campers packed only the most essential items, including a multi-purpose eating utensil."
"vaccine","Noun","The doctor administered a vaccine to the child to protect her from catching the flu during the winter.|Scientists worked around the clock to develop an effective vaccine to stop the spread of the virus."
"wilderness","Noun","They spent a week hiking through the wilderness, carrying all their food and sleeping in a tent.|The national park was established to preserve the vast wilderness from being developed into a city."
"amendment","Noun","The lawmakers proposed an amendment to the constitution to guarantee the right to free speech.|It took a two-thirds majority vote in Congress to pass the latest amendment to the bill."
"beverage","Noun","The flight attendant walked down the aisle asking passengers if they would like a cold beverage.|Water is the most consumed beverage in the world, followed closely by tea and coffee."
"collision","Noun","The two cars were badly damaged in a head-on collision at the intersection this morning.|Astronomers are studying the predicted collision between two distant galaxies."
"expertise","Noun","Because of her expertise in computer coding, she was hired to lead the software development team.|The surgeon's expertise was evident in the way he handled the most delicate part of the operation."
"incentive","Noun","The company offered a cash bonus as an incentive for employees to meet their sales goals early.|The government provided a tax incentive to encourage citizens to install solar panels on their roofs."
"labyrinth","Noun","The library was a labyrinth of narrow hallways and hidden staircases where it was easy to get lost.|The mythological hero had to navigate a complex labyrinth to find and defeat the monster."
"precipice","Noun","The hiker stood at the edge of the precipice and looked down at the valley floor miles below.|The two nations were standing on the precipice of war before the peace treaty was signed."
word,category,sentences
"through","Adposition","The hiker had to push his way through the dense underbrush to reach the hidden waterfall.|The light shone through the stained-glass window, casting colorful patterns on the floor."
"between","Adposition","The small village is nestled in a narrow valley between two towering mountain ranges.|I had to choose between the chocolate cake and the fruit tart for dessert."
"during","Adposition","Please keep your mobile phones turned off during the performance to avoid distracting the actors.|It rained heavily during the night, but the sun was shining by the time we woke up."
"against","Adposition","The frustrated gardener leaned his heavy metal shovel against the oak tree and took a break.|The local residents are protesting against the construction of a new highway through the park."
"among","Adposition","The red cardinal was easy to spot among the many brown sparrows gathered at the bird feeder.|He felt a sense of peace while walking among the ancient trees of the redwood forest."
"beyond","Adposition","The explorers wanted to see what lay beyond the horizon, so they continued sailing west.|Her performance was excellent and went far beyond the expectations of her demanding coach."
"despite","Adposition","They decided to go for a long walk in the woods despite the dark clouds and the threat of rain.|Despite his lack of formal training, he became one of the most successful chefs in the city."
"underneath","Adposition","The children found a dusty old wooden chest hidden underneath the loose floorboards in the attic.|She wore a warm thermal shirt underneath her heavy winter coat to stay cozy in the snow."
"beside","Adposition","The golden retriever sat patiently beside its owner's chair, waiting for a scrap of food to fall.|There is a small, charming cafe located right beside the old stone bridge."
"throughout","Adposition","The upbeat music could be heard throughout the entire building, from the basement to the roof.|He remained calm and focused throughout the long and difficult surgical procedure."
"towards","Adposition","The puppy barked excitedly and ran towards the front door as soon as it heard the key turn.|The government is taking significant steps towards reducing carbon emissions over the next decade."
"beneath","Adposition","The treasure hunters believed that a pirate ship was buried deep beneath the shifting desert sands.|He tried to hide his true emotions, but his sadness was visible just beneath the surface."
"within","Adposition","The delivery service guarantees that your package will arrive within three business days.|The answer to the riddle is hidden within the text of the poem itself."
"concerning","Adposition","The manager called a meeting to discuss several important issues concerning office safety.|I received an urgent email from the bank concerning some suspicious activity on my account."
"under","Adposition","The cat was hiding under the kitchen table because it was scared of the loud thunder.|In this country, children under the age of eighteen are not permitted to vote in elections."
"across","Adposition","The marathon runners had to race across the long bridge that connects the two islands.|He drew a straight line across the piece of paper using a ruler and a black marker."
"opposite","Adposition","The post office is located directly opposite the train station on the other side of the street.|In the debate, she argued for the opposite point of view to challenge the audience's assumptions."
"including","Adposition","The price of the tour is fifty dollars, including lunch and a guided walk through the museum.|The whole family attended the reunion, including several cousins I hadn't seen in years."
"past","Adposition","If you walk past the library and turn left at the fountain, you will see the hospital.|It is already half past ten, so we should probably start heading home before it gets too late."
"above","Adposition","The eagle soared high above the clouds, looking down at the mountains below.|Please write your name and address in the space provided above the dotted line."`;
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
      $$renderer2.push(`<!--]--></div> <fieldset><legend class="mb-1 block text-sm font-medium text-gray-700">Example Sentences</legend> <div class="space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(manualSentences);
      for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
        each_array_2[idx];
        $$renderer2.push(`<div class="flex gap-2"><textarea placeholder="Type a sentence using the word…" rows="2" class="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">`);
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
