# Simple Image Annotation App

A simple image upload and annotation app. Made with [ReactJS](https://reactjs.org/docs/create-a-new-react-app.html), [Flask](https://flask.palletsprojects.com/en/2.0.x/) and [PyMongo](https://pymongo.readthedocs.io/en/stable/).

# How To Setup This App

## Required installs

1. Ensure [MongoDB Server v5.0.5+](https://www.mongodb.com/try/download/community) is installed and running on default port `27017`.
2. Ensure [NodeJS v16+](https://nodejs.org/en/) is installed.
3. Ensure [Python v10+](https://www.python.org/) is installed.
4. To install all NodeJS dependencies, open a Command window on the root folder and execute the following command:
	```
	$ npm install
	```
5. To install all Python dependencies, open a Command window on the root folder and execute the following command:
	```
	$ cd server
	$ pip install -r requirements.txt
	```

## Host and run app

1. Start the server and client hosting by double-clicking the `run-server.bat` file.
   - Alternatively, open a Command window on the root folder and execute the following command:
		```
		$ cd server
		$ python api.py
		```
2. The app can be accessed at [http://localhost:3001](http://localhost:3001)

## Rebuilding the client

If you wish to modify the React app:
1. Edit the files in `src`
2. Open a Command window on the root folder and execute the following command:
	```
	$ npm run build
	```
3. Client-side source files will be compiled and a `build` folder will be created / updated with the current version of the React app

# How To Use This App

## User registration

First-time visitors to the app will greeted by the registration page.

![Registration Page](./screencaps/registration-page.JPG)

Enter your desired username (alphanumeric characters only) and password.

Re-enter your password to confirm it.

![Registration Complete](./screencaps/registration-page-complete.JPG)

Click on the `Register Me` button to complete the registration. If successful, you will be brought to your personal projects page.

---

## User login

First-time visitors to the app will greeted by the registration page.

Click on the `Login` button to navigate to the user login page.

![Login Page](./screencaps/login-page.JPG)

Enter your username and password.

![Login Complete](./screencaps/login-page-complete.JPG)

Click on the `Login` button to complete the login. If successful, you will be brought to your personal projects page.

*If your user credentials are incorrect, simply re-enter the correct credentials.*

---

## User logout

If you are logged in, the `Logout` button can be found on the top navigation panel.

![Logout Button](./screencaps/logout-button.JPG)

Click on the `Logout` button to logout.

![Logout Complete](./screencaps/logout-button-complete.JPG)

---

## User create new project

If you are logged in, the `+ Create New Project` button can be found below the `My Projects` page title.

![Create New Project Button](./screencaps/create-project-button.JPG)

Click on the button and a page prompt will appear. Type in your desired project title and click `OK`.

![Create Project Prompt](./screencaps/create-project.JPG)

A new project will be created and you will be brought to the empty project page.

![Create Project Complete](./screencaps/create-project-complete.JPG)

---

## User select an existing project

If you are logged in, the buttons for your existing project can be found below the `My Projects` page title.

![Project Buttons](./screencaps/nav-project.JPG)

Click on your desired project button and you will be navigated to that project's page.

![Another Project Page](./screencaps/nav-project-complete.JPG)

---

## User upload images

If you are logged in and have created at least one existing project, the `+ Upload New Images` button can be found below the `My Projects` page title.

![Another Project Page](./screencaps/nav-project-complete.JPG)

Click on the button and an upload window will appear. Select the images you want to upload to the project and click `Open`.

![Upload Window](./screencaps/upload-window.JPG)

If successful, new images will be displayed automatically. Otherwise, re-click on the project button to refresh the page.

![Upload Complete](./screencaps/upload-window-complete.JPG)

---

## User annotate images

If you are logged in, have created at least one existing project, and have uploaded at least one image, the images for the currently selected project will be displayed.

![Image Display](./screencaps/upload-window-complete.JPG)

Click on an image you desire to annotate. A full-sized image will pop up.

![Full Image](./screencaps/annotate-image.JPG)

Click and drag across a feature of the image. A dropdown menu will appear. Select the category that best represents the feature.

![Annotation In-Progress](./screencaps/annotate-image-dropdown.JPG)

Once complete, the feature will be labelled on the image.

![Annotation Complete](./screencaps/annotate-image-complete.JPG)

---

## User download image annotation data

Annotated images can be identified by a solid yellow border. Non-annotated images have dashed white borders.

![Annotated vs Non-Annotated Images](./screencaps/download-annotation.JPG)

Select an annotated image and click on the `Download CSV` button at the bottom of the full image to download the annotation coordinates.

![Annotation Complete](./screencaps/annotate-image-complete.JPG)

The downloaded CSV file is structure as follows:

![Annotation CSV](./screencaps/download-annotation-csv.JPG)

You can also download the entire projects' annotation data by clicking on the `Download CSV [ All Images ]` button the project's page.

![Annotation Full](./screencaps/download-annotation-full.JPG)

# External Libraries Used

The following NodeJS libraries were used to support the functions of the app:

## Client-side
- [styled-components](https://styled-components.com/)
- [sheetjs](https://sheetjs.com/)
- [react-router](https://reactrouter.com/)

## Server-side
- [flask](https://flask.palletsprojects.com/en/2.0.x/)
- [pymongo](https://pymongo.readthedocs.io/en/stable/)