'''
	This is the MongoDB handler for the app
'''

from pymongo import MongoClient
from gridfs import GridFS
from datetime import datetime
from bson.objectid import ObjectId
from secrets import token_urlsafe

# Database globals
DB_NAME = 'simple-anno'
DB_URI = f'mongodb://localhost:27017/{DB_NAME}'

# Collection globals
COL_USERS = 'Users'
COL_PROJECTS = 'Projects'
COL_IMAGES = 'Images'

# Collection data field globals
FIELDS_createdBy = 'createdBy'
FIELDS_updatedBy = 'updatedBy'
FIELDS_createdAt = 'createdAt'
FIELDS_updatedAt = 'updatedAt'
FIELDS_USERNAME = 'user'
FIELDS_HASH = 'hash'
FIELDS_SALT = 'salt'
FIELDS_PROJECT = 'project'
FIELDS_FILENAME = 'filename'
FIELDS_FILE_ID = 'fileId'
FIELDS_FILE_MIMETYPE = 'mimetype'
FIELDS_FILE_COORDS = 'coords'
FIELDS_FILENAME_UNIQUE = 'fileunique'

class ManagerMongo():
	'''
		Creates and maintains a connection to the MongoDB database. 
	'''
	def __init__(self):
		# Connect to database
		self.client = MongoClient(DB_URI)
		self.db = self.client.get_default_database()

		# Store references to each collection
		self.users = self.db[COL_USERS]
		self.projects = self.db[COL_PROJECTS]
		self.images = self.db[COL_IMAGES]
		self.gridFS = GridFS(self.db)

	def add_user(self,username,hash,salt):
		'''
			Adds a user to the Users collection. Returns the assigned user id.
		'''
		cur_time = datetime.now()

		res = self.users.insert_one({
			FIELDS_createdAt: cur_time,
			FIELDS_updatedAt: cur_time,
			FIELDS_USERNAME: username,
			FIELDS_HASH: hash,
			FIELDS_SALT: salt
		})

		return res.inserted_id

	def get_user(self,username):
		'''
			Returns user doc or None from Users collection.
		'''

		return self.users.find_one({
			FIELDS_USERNAME: username
		})

	def add_project(self,user_id,project_title):
		'''
			Adds a project to the Projects collection. Returns the assigned project id.
		'''
		cur_time = datetime.now()

		res = self.projects.insert_one({
			FIELDS_createdAt: cur_time,
			FIELDS_createdBy: ObjectId(user_id),
			FIELDS_PROJECT: project_title
		})
		return res.inserted_id

	def get_project(self,user_id,project_title):
		'''
			Returns project id or None
		'''
		return self.projects.find_one({
			FIELDS_createdBy: ObjectId(user_id),
			FIELDS_PROJECT: project_title
		})

	def get_projects(self,user_id):
		'''
			Returns list of docs from user's collection.
		'''

		return list(self.projects.find({
			FIELDS_createdBy: ObjectId(user_id)
		}))

	def add_image(self,image,image_name,user_id,project_id):
		'''
			Adds image to the Images collection. Returns the assigned image id.
		'''

		# Store image in gridFS
		cur_time = datetime.now()

		# Create a unique filename for reference
		uid = token_urlsafe(16)
		unique_filename = f'{uid}.{image_name}'

		image_id = self.gridFS.put(
			image,
			fileunique=unique_filename,
			mimetype=image.mimetype,
			createdBy=ObjectId(user_id),
			project=ObjectId(project_id)
		)

		# Reference image details in Images collection
		res = self.images.insert_one({
			FIELDS_FILE_ID: image_id,
			FIELDS_FILENAME_UNIQUE: unique_filename,
			FIELDS_FILE_MIMETYPE: image.mimetype,
			FIELDS_createdAt: cur_time,
			FIELDS_PROJECT: ObjectId(project_id),
			FIELDS_createdBy: ObjectId(user_id),
			FIELDS_FILE_COORDS: []	# Annotation coordinates
		})

		return res.inserted_id

	def get_images_info(self,user_id,project_id):
		'''
			Returns a list of image info from the Image collection
		'''

		return list(self.images.find({
			FIELDS_createdBy: ObjectId(user_id),
			FIELDS_PROJECT: ObjectId(project_id)
		}))

	def update_image_info(self,filename_unique,payload):
		'''
			Updates fields of the image info from the Image collection. Returns updated doc or None
		'''

		return self.images.find_one_and_update({
			FIELDS_FILENAME_UNIQUE: filename_unique
		},{
			'$set': payload
		})
	
	def get_image(self,filename):
		'''
			Returns image binary file from gridFS.
		'''

		return self.gridFS.find_one({
			FIELDS_FILENAME_UNIQUE: filename
		})

# Test cases here
if __name__ == '__main__':
	pass