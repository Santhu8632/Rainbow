from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rainbow-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rainbow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'admin_login'


# ==================== MODELS ====================
class Admin(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password_hash = db.Column(db.String(255))

    def set_password(self, p):
        self.password_hash = generate_password_hash(p)

    def check_password(self, p):
        return check_password_hash(self.password_hash, p)


class Enquiry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    service = db.Column(db.String(150))
    message = db.Column(db.Text)
    source = db.Column(db.String(50), default='website')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    service = db.Column(db.String(150))
    consultation_type = db.Column(db.String(50))
    preferred_date = db.Column(db.String(50))
    location = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(uid):
    return Admin.query.get(int(uid))


# ==================== COMPANY DATA ====================
COMPANY = {
    "name": "Rainbow Consultants",
    "established": 2018,
    "founder": "Ullas",
    "founder_qualification": "B.E.",
    "experience": "10+ Years",
    "projects": "4800+",
    "employees": 6,
    "phone_primary": "9986220778",
    "phone_secondary": "9900121547",
    "whatsapp": "9986220778",
    "email": "rainbowconsultants266@gmail.com",
    "address": "#469, SRMV Layout 5th Block, Bengaluru - 560091",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560091",
    "working_hours": "9 AM - 11 PM (24/7 Support)",
    "map_embed": "https://www.google.com/maps?q=SRMV+Layout+5th+Block+Bengaluru+560091&output=embed",
    "map_link": "https://maps.app.goo.gl/q8ZFixokEJv6fLeN6",
}

SERVICES = [
    {"icon": "fa-file-signature", "name": "Building Plan Approval", "desc": "End-to-end building plan approval & sanction services with complete authority liaison."},
    {"icon": "fa-drafting-compass", "name": "Building Plan Preparation", "desc": "Floor plans, site plans, elevations, sections, parking layout & FAR/FSI calculations."},
    {"icon": "fa-map-marked-alt", "name": "Land Conversion & DC Conversion", "desc": "Complete assistance for land use conversion and DC conversion processes."},
    {"icon": "fa-building", "name": "BDA / GBA Approvals", "desc": "Approvals from Bengaluru Development Authority & Greater Bengaluru Authority."},
    {"icon": "fa-map", "name": "BMRDA / BIAPPA Approvals", "desc": "Expert handling of BMRDA and BIAPPA approval processes."},
    {"icon": "fa-industry", "name": "KIADB Approvals", "desc": "Industrial area development board approvals handled professionally."},
    {"icon": "fa-landmark", "name": "MDA Approvals - Mysuru", "desc": "Mysuru Development Authority approvals with local expertise."},
    {"icon": "fa-file-alt", "name": "Khata & e-Khata Services", "desc": "Complete Khata transfer, registration and e-Khata services."},
    {"icon": "fa-sync-alt", "name": "Plan Revision & Regularisation", "desc": "Revision and regularisation of existing building plans."},
    {"icon": "fa-check-circle", "name": "Completion Certificate (CC)", "desc": "Obtaining completion certificates from concerned authorities."},
    {"icon": "fa-home", "name": "Occupancy Certificate (OC)", "desc": "End-to-end assistance for occupancy certificate procurement."},
    {"icon": "fa-file-contract", "name": "NOC & Statutory Approvals", "desc": "Fire NOC, Airport, Environment, BWSSB, BESCOM and other NOCs."},
    {"icon": "fa-search", "name": "Property Documentation", "desc": "Sale deed, title documents, RTC and property document verification."},
    {"icon": "fa-ruler-combined", "name": "Site Inspection & Survey", "desc": "Site visit, plot measurement and verification, road width checks."},
    {"icon": "fa-handshake", "name": "Approval Follow-up & Liaison", "desc": "Continuous follow-up with authorities until final approval."},
    {"icon": "fa-hard-hat", "name": "Construction Consultancy", "desc": "Complete construction consultancy from planning to execution."},
]


# ==================== PUBLIC ROUTES ====================
@app.route('/')
def index():
    return render_template('index.html', company=COMPANY, services=SERVICES)


# ==================== API ROUTES ====================
@app.route('/api/enquiry', methods=['POST'])
def api_enquiry():
    try:
        d = request.get_json() or request.form
        e = Enquiry(
            name=d.get('name', ''), phone=d.get('phone', ''),
            email=d.get('email', ''), service=d.get('service', ''),
            message=d.get('message', ''), source=d.get('source', 'website')
        )
        db.session.add(e)
        db.session.commit()
        return jsonify({"status": "success", "message": "Thank you! We'll contact you soon."})
    except Exception as ex:
        return jsonify({"status": "error", "message": str(ex)}), 500


@app.route('/api/appointment', methods=['POST'])
def api_appointment():
    try:
        d = request.get_json() or request.form
        a = Appointment(
            name=d.get('name', ''), phone=d.get('phone', ''),
            email=d.get('email', ''), service=d.get('service', ''),
            consultation_type=d.get('consultation_type', ''),
            preferred_date=d.get('preferred_date', ''),
            location=d.get('location', ''), notes=d.get('notes', '')
        )
        db.session.add(a)
        db.session.commit()
        return jsonify({"status": "success", "message": "Appointment received! We'll confirm shortly."})
    except Exception as ex:
        return jsonify({"status": "error", "message": str(ex)}), 500


# ==================== ADMIN ROUTES ====================
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))
    if request.method == 'POST':
        u = request.form.get('username', '').strip()
        p = request.form.get('password', '')
        admin = Admin.query.filter_by(username=u).first()
        if admin and admin.check_password(p):
            login_user(admin)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid username or password!', 'error')
    return render_template('admin_login.html')


@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for('admin_login'))


@app.route('/admin/dashboard')
@app.route('/admin')
@login_required
def admin_dashboard():
    enquiries = Enquiry.query.order_by(Enquiry.created_at.desc()).all()
    appointments = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return render_template('admin_dashboard.html',
                           enquiries=enquiries,
                           appointments=appointments,
                           total_enquiries=len(enquiries),
                           total_appointments=len(appointments))


@app.route('/admin/delete/enquiry/<int:id>', methods=['POST'])
@login_required
def delete_enquiry(id):
    e = Enquiry.query.get_or_404(id)
    db.session.delete(e)
    db.session.commit()
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/delete/appointment/<int:id>', methods=['POST'])
@login_required
def delete_appointment(id):
    a = Appointment.query.get_or_404(id)
    db.session.delete(a)
    db.session.commit()
    return redirect(url_for('admin_dashboard'))


# ==================== INIT DB ====================
def init_db():
    with app.app_context():
        db.create_all()
        if not Admin.query.filter_by(username='admin').first():
            admin = Admin(username='admin')
            admin.set_password('rainbow@2025')
            db.session.add(admin)
            db.session.commit()
            print("\n✅ Default Admin Created")
            print("   Username: admin")
            print("   Password: rainbow@2025\n")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
