# SqlBuilder README
Easy to build MySQL table though text file.  
通过文本文件轻松构建MySQL表。

## Features 功能
This extension saved a lot of unnecessary create MySQL table time.  
省去设计完表还要去建表的麻烦。  

## How to use 使用方式
Open text file though VSCode. Ctrl + Shift + p open the commend line input commend.  
使用VSCode打开txt文件，然后按下Ctrl + Shift + p打开命令行，输入命令
>* `hello`: Check configuration and be ensure the extension has run.  
>查看当前配置,确定插件是否在被加载
>* `config`: Open config.json, restart VSCode after modified it.  
>打开config.js,进行修改后重启VSCode,config.js文件结构在下文中提到。
>* `example`: Text file example.  
>打开txt文件示例，txt文件结构详细情况见下文。
>* `execute`: Create MySQL table though the text file.  
>通过该文本文件创建MySQL表
>* `execute_fk`: Add foreign key constraint after created all table.  
>使用该命令添加外键约束, 确保在添加约束前所涉及的表都已经建好。  
>* `dir`: Load all files in selected directory.  
>选择目录，目录中的所有txt将会被视为可处理的文件。 
>* `execdir`: Create tables according to loaded files.  
>创建加载的路径下所有txt对应的数据表。 
>* `exedir_fk`: Add foreign key constraint according to loaded files.  
>建立加载的路径下所有数据表的外键约束。 

Text file example  
txt文件范例：  
  
>![txt文件范例图](https://user-images.githubusercontent.com/42128653/82065135-49aba000-9700-11ea-908c-adee2dd91658.png)  
>File name is table name.  
>文件名就是表名  
>Field name,date type,comment constitutes a row, separated by Tab. Also can copy from Word or Excel.  
>txt文件中的一行由字段名，数据类型，备注信息组成, 中间由`Tab键`分隔，即`'\t'`。可以在Word或Excel中设计好之后复制到txt中。  
>Keyword "primary key","not null","default","foreign key" in comment can be distinguished by extension.(chinese only in this version)  
>在备注信息中，可识别的关键词有`“主键”`，`“非空”`，`“默认值为”`，`“表外键”`。  
>其中，关键词`"默认值为"`以中文标点“，”结束，例如`“默认值为1，xxx”，或者写在句末`。  
>关键词`"表外键"`以中文标点“，”开头和结尾，例如`“xxx，user表外键，xxx”，或者写在句末`。

config.json：在config.json中配置信息。
> ![config.json文件结构图](https://user-images.githubusercontent.com/42128653/82110707-02122c00-9773-11ea-89ba-3702e73e8bb8.png)  
>`DBConfig`:Config database. 配置数据库的信息。  
>`outSQLPath`:Config path,output SQL file, none means dont output SQL file. 配置输出的SQL语句文件的路径，为空则表示不输出SQL语句文件。  
>`PKGenStra`:Primary key generation strategy, described by SQL. 主键生成策略，用SQL的方式规定。  

## Requirements 使用需求
* `nodejs mysql module`: Extension has included nodejs mysql module already, if not running, install it before apply, such as "npm install mysql".  
这个插件已经包含了nodejs mysql 包, 如果插件无法正常运行,请安装 nodejs mysql包之后再试。

## Contact 联系我

Email: ashqi@hotmail.com  
电子邮件：ashqi@hotmail.com

-----------------------------------------------------------------------------------------------------------
### For more information 更多

* [repository 存储库](https://github.com/Syclight/SQLBuilder.git)

**Enjoy!**
