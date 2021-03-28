# LA Hacks 2021

Tired of boring meetings with small squares on Zoom? We certainly are. In real life — in a group setting — you can have small side conversations with friends or colleagues. In Zoom, on the other hand, you have to separately message or call your friends, absorbing your attention. Shouldn't there be an in-between?

For PROJECT NAME, we concluded that spacial audio is how sound is meant to be, making any video call more interesting and productive!
Our project for LA Hacks 2021 is an adaptive spacial audio communication tool for calls, meetings, conferences, and talking to friends. PROJECT NAME adds spice to video calls, immersing users in the spacial audio world. 

- [Project on Devpost](https://devpost.com/software/gathering-6cku7m?ref_content=user-portfolio&ref_feature=in_progress)

### Deploy
[![Run on Google
Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/JacobZwang/lahacks2021.git)


### Run Instructions

With Docker Compose (recommended)
```
docker-compose up --build
```

With Docker
```
docker build . --no-cache --progress=plain -t lahacks2021 &&
docker run  -p 8080:8080 --name lahacks2021 lahacks2021
```

With NPM 
Node 14
```
npm install
npm run dev
```


### Overall Structure

![LA Hacks](https://user-images.githubusercontent.com/38309438/111939856-95e70f80-8a8a-11eb-8b27-00c6e4cff838.png)
