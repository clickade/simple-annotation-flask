'''
	This is the Python REST API for the app
'''
from flask import Flask, render_template, request, jsonify, abort, send_file, redirect, session
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename
from datetime import timedelta
import bcrypt, json, secrets

from database import FIELDS_FILE_COORDS, ManagerMongo, FIELDS_PROJECT, FIELDS_FILENAME, FIELDS_createdBy,FIELDS_FILENAME_UNIQUE

PORT = 3001
URL = f'http://localhost:{PORT}'
DB_MANAGER = ManagerMongo()
ALLOWED_IMAGE_EXTENSIONS = {'png','jpg','jpeg'}

# Specify app config
app = Flask('img-annotation-app',static_url_path='',static_folder='../build',template_folder='../build')
app.secret_key = '6aac5bb8-25ae-44e7-8fcd-8b7e46a5d29c' # uuid.uuid4()

def check_session_valid():
	'''
		Returns error 401 if user is not logged in
	'''
	if not (session.get('uid') and session.get('usr')):
		return False
	return True

@app.errorhandler(HTTPException)
def generic_error(evt):
	'''
		All errors are returned as JSON to prevent redirect
	'''

	# If user refreshes on a SPA, we re-serve the index.html
	if evt.code == 404:
		return redirect(URL, code=302)

	return jsonify({
		'code': evt.code if evt.code else 500,
		'name': evt.name,
		'description': evt.description if evt.description else 'Internal Server Error'
	}), evt.code if evt.code else 500

@app.before_request
def permanent_session():
	'''
		Sustain session up to 15 mins after browser closes
	'''
	session.permanent = True
	app.permanent_session_lifetime = timedelta(minutes=15)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def main(path):
	'''
		Serves website html
	'''
	return render_template('index.html')

@app.route('/api/login',methods=['POST'])
def user_login():
	'''
		Handles user login requests
	'''

	args = request.json

	# Ensure the request has required fields
	assert len(args) == 2
	assert 'usr' in args
	assert 'pwd' in args

	username = args['usr']
	password = args['pwd']

	# Get user info from database
	user_id = DB_MANAGER.get_user(username)
	if not user_id:
		abort(400, description='User not found.')

	hashed = bcrypt.hashpw(password.encode('utf8'),user_id['salt'])

	# If password matches hash, return specific user info (can convert into JWT in future)
	is_authenticated = bcrypt.checkpw(password.encode('utf8'), hashed)
	if is_authenticated:
		# Update session
		session['uid'] = str(user_id.get('_id'))
		session['usr'] = username

		# Return session
		login_info = {
			'uid': str(user_id.get('_id')),
			'usr': username
		}
		return jsonify(login_info)

	# Otherwise, return an error message
	abort(401, description='Username and password combo is invalid.')

@app.route('/api/session',methods=['POST'])
def session_still_valid():
	'''
		Checks if session is valid and returns session variables
	'''
	if not check_session_valid():
		abort(401, 'No session found')

	return jsonify({
		'uid': session.get('uid'),
		'usr': session.get('usr'),
	})

@app.route('/api/logout')
def user_logout():
	'''
		Handles user logout request
	'''

	# Clear session variables
	session.pop('uid',None)
	session.pop('usr',None)
	return redirect(URL, code=302)

@app.route('/api/registration',methods=['POST'])
def user_registration():
	'''
		Handles user registration requests
	'''
	args = request.json

	# Ensure the request has required fields
	assert len(args) == 2
	assert 'usr' in args
	assert 'pwd' in args

	username = args['usr']
	password = args['pwd']

	# Ensure no user exists with same name
	existing_user = DB_MANAGER.get_user(username)
	if existing_user:
		abort(400,description='Username already exists.')

	# Generate salt, password hash and store in database
	salt = bcrypt.gensalt()
	hashed = bcrypt.hashpw(password.encode('utf8'), salt)
	user_id = DB_MANAGER.add_user(username,salt,hashed)

	# Update session
	session['uid'] = str(user_id)
	session['usr'] = username

	# Returns specific user info (can convert into JWT in future)
	return jsonify({
		'uid': str(user_id),	# User ID
		'usr': username			# Username
	})

@app.route('/api/projects/create',methods=['POST'])
def project_create():
	'''
		Handles project creation
	'''
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	args = request.json

	# Ensure the request has required fields
	assert len(args) == 2
	assert 'uid' in args
	assert 'prj' in args

	user_id = args['uid']
	project_title = args['prj']

	# Ensure user has existing project with the same title
	existing_project = DB_MANAGER.get_project(user_id,project_title)
	if existing_project:
		abort(400, 'A project with that name already exists.')

	# Create project referencing uid
	project_id = DB_MANAGER.add_project(user_id,project_title)

	# Return project id
	return jsonify([{
		'pid': str(project_id),	# Project ID
		'uid': user_id,			# User ID
		'prj': project_title	# Project title
	}])

@app.route('/api/projects/list',methods=['POST'])
def project_list():
	'''
		Returns list of user projects
	'''
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	args = request.json

	# Ensure the request has required fields
	assert len(args) == 1
	assert 'uid' in args

	user_id = args['uid']

	# Get list of all projects by user
	docs = DB_MANAGER.get_projects(user_id)
	
	def reduceDocs(doc):
		return {
			'pid': str(doc.get('_id')),		# Project ID
			'uid': str(doc.get(FIELDS_createdBy)),	# User ID
			'prj': doc.get(FIELDS_PROJECT),		# Project title
		}
	
	return jsonify(list(map(reduceDocs,docs)))

def json2String(file):
	'''
		Converts input JSON object into string
	'''
	return json.dumps(file)

@app.route('/api/projects/images',methods=['POST'])
def project_images():
	'''
		Returns all image docs (without base64 data) from a specific project
	''' 
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	args = request.json

	# Ensure the request has required fields
	assert len(args) == 2
	assert 'uid' in args
	assert 'pid' in args

	user_id = args['uid']
	project_id = args['pid']

	image_docs = DB_MANAGER.get_images_info(user_id,project_id)

	def reduceDocs(doc):
		return {
			'pid': project_id,				# Project ID
			'uid': user_id,					# User ID
			'fnu': str(doc.get(FIELDS_FILENAME_UNIQUE)),			# File ID
			'url': f'/api/image/{doc.get(FIELDS_FILENAME_UNIQUE)}', # Image URL
			'coords': doc.get(FIELDS_FILE_COORDS)					# Image annotation ID
		}

	return jsonify(list(map(reduceDocs,image_docs))), 201

@app.route('/api/projects/update',methods=['POST'])
def update_image():
	'''
		Updates the image doc from a specific project
	'''
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	args = request.json

	# Ensure the request has required fields
	assert len(args) == 2
	assert 'fnu' in args
	assert 'doc' in args

	filename_unique = secure_filename(args['fnu'])
	payload = args['doc']

	doc = DB_MANAGER.update_image_info(filename_unique,payload)

	if not doc:
		abort(404, 'Invalid file.')

	return jsonify({'updated':True}), 201

@app.route('/api/image/<path:path>')
def serve_image(path):
	'''
		Serves image from database
	'''
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	if not allowed_ext(path):
		abort(400, 'Invalid filename.')

	# Sanitize filename
	filename = secure_filename(path)
	ext = filename.rsplit('.',1)[1].lower()
	mimetype = f'image/{ext}'

	image_bin = DB_MANAGER.get_image(filename)
	if not image_bin:
		abort(404, 'Resource not found.')

	return send_file(
		image_bin,
		mimetype=mimetype,
		as_attachment=False,
		attachment_filename=filename
	)

def allowed_ext(filename):
	'''
		Returns True if filename has correct extension else return False
	'''
	return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@app.route('/api/projects/upload',methods=['POST'])
def project_upload():
	'''
		User uploads an image to database
	'''
	if not check_session_valid():
		abort(401, 'User unauthorized.')

	args = request.form # Data arrives in request.form

	# Ensure the request has required fields
	assert 'uid' in args
	assert 'pid' in args

	user_id = args['uid']
	project_id = args['pid']
	files = request.files.getlist('images')
	
	image_docs = []
	for file in files:
		if not file.filename:
			abort(400, 'Empty filename detected.')

		if file and allowed_ext(file.filename):
			filename = secure_filename(file.filename) # Sanitize incoming filename
			image_doc = DB_MANAGER.add_image(file,filename,user_id,project_id)

			output_doc = {
				'pid': project_id,				# Project ID
				'uid': user_id,					# User ID
				'fnu': str(image_doc.get(FIELDS_FILENAME_UNIQUE)),			# File ID
				'url': f'/api/image/{image_doc.get(FIELDS_FILENAME_UNIQUE)}', # Image URL
				'coords': image_doc.get(FIELDS_FILE_COORDS)					# Image annotation ID
			}

			image_docs = [*image_docs,output_doc]

	return jsonify(image_docs), 201

# Run server
if __name__ == '__main__':
	app.run(host='localhost',port=PORT,debug=True)