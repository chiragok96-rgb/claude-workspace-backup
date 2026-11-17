# Rath Yatra v2 - procedural scene (Blender 5.3 / bpy + Cycles)
import bpy, bmesh, math, random, sys, time
from mathutils import Matrix, Euler, Vector
from math import radians as R, pi, sin, cos, sqrt

def arg(k, d):
    for a in sys.argv:
        if a.startswith(k+"="): return a.split("=",1)[1]
    return d

OUT      = arg("out", "/tmp/out.png")
RES_X    = int(arg("rx", 540)); RES_Y = int(arg("ry", 960))
SAMPLES  = int(arg("s", 40))
NCROWD   = int(arg("crowd", 6000))
USE_VOL  = arg("vol", "0") == "1"
CAM      = [float(v) for v in arg("cam", "34,-40,12.5").split(",")]
TGT      = [float(v) for v in arg("tgt", "-4,22,12.0").split(",")]
LENS     = float(arg("lens", 45))
SUN_ROT  = float(arg("sunrot", 270))
SUN_ELEV = float(arg("sunelev", 6.0))

random.seed(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
SC = bpy.context.scene; COLL = SC.collection
def link(o): COLL.objects.link(o); return o

# ---------------------------------------------------------------- materials
_MC = {}
def mat(name, col, rough=0.6, metal=0.0, ior=1.45):
    if name in _MC: return _MC[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    _MC[name] = m; return m

def striped(name, c1, c2, count=24, rough=0.86):
    if name in _MC: return _MC[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N["Principled BSDF"]; b.inputs["Roughness"].default_value = rough
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs["Vector"])
    at = N.new("ShaderNodeMath"); at.operation='ARCTAN2'
    L.new(sep.outputs["Y"], at.inputs[0]); L.new(sep.outputs["X"], at.inputs[1])
    mu = N.new("ShaderNodeMath"); mu.operation='MULTIPLY'; mu.inputs[1].default_value = count/(2*pi)
    L.new(at.outputs[0], mu.inputs[0])
    fr = N.new("ShaderNodeMath"); fr.operation='FRACT'; L.new(mu.outputs[0], fr.inputs[0])
    rp = N.new("ShaderNodeValToRGB"); rp.color_ramp.interpolation='CONSTANT'
    e = rp.color_ramp.elements
    e[0].position=0.0; e[0].color=(*c1,1); e[1].position=0.5; e[1].color=(*c2,1)
    L.new(fr.outputs[0], rp.inputs["Fac"]); L.new(rp.outputs["Color"], b.inputs["Base Color"])
    _MC[name] = m; return m

GOLD=(0.80,0.56,0.12); WOOD=(0.36,0.20,0.10); WOODL=(0.58,0.36,0.18)
RED=(0.60,0.05,0.04);  YELLOW=(0.90,0.63,0.05); GREEN=(0.05,0.28,0.11)
BLACK=(0.035,0.032,0.04); WHITE=(0.90,0.88,0.84)
M_GOLD=mat("gold",GOLD,0.25,1.0); M_WOOD=mat("wood",WOOD,0.78)
M_WOODL=mat("woodl",WOODL,0.72); M_IRON=mat("iron",(0.07,0.07,0.075),0.42,1.0)

# ---------------------------------------------------------------- mesh prims (data API: fast)
def _obj(me, name, loc=(0,0,0), rot=(0,0,0), m=None):
    o = bpy.data.objects.new(name, me); link(o)
    o.location = loc; o.rotation_euler = rot
    if m: 
        if not me.materials: me.materials.append(m)
    return o

def lathe(prof, seg=56, name="lathe", smooth=True, m=None, loc=(0,0,0), rot=(0,0,0)):
    bm = bmesh.new(); rings=[]
    for (r,z) in prof:
        rings.append([bm.verts.new((cos(2*pi*i/seg)*r, sin(2*pi*i/seg)*r, z)) for i in range(seg)])
    for k in range(len(rings)-1):
        A,B = rings[k], rings[k+1]
        for i in range(seg):
            j=(i+1)%seg
            try: bm.faces.new((A[i],A[j],B[j],B[i]))
            except: pass
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth=True
    return _obj(me, name, loc, rot, m)

def _bmesh_to_obj(bm, name, loc, rot, m, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth=True
    return _obj(me, name, loc, rot, m)

def cyl(r, d, loc=(0,0,0), rot=(0,0,0), v=20, m=None, name="cyl"):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=v,
                          radius1=r, radius2=r, depth=d)
    return _bmesh_to_obj(bm, name, loc, rot, m)

def cone(r1, r2, d, loc=(0,0,0), rot=(0,0,0), v=24, m=None, name="cone"):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=v,
                          radius1=r1, radius2=r2, depth=d)
    return _bmesh_to_obj(bm, name, loc, rot, m)

def box(sc, loc=(0,0,0), rot=(0,0,0), m=None, name="box"):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=sc, verts=bm.verts)
    return _bmesh_to_obj(bm, name, loc, rot, m)

def sph(r, loc=(0,0,0), seg=16, m=None, name="sph"):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(6,seg//2), radius=r)
    return _bmesh_to_obj(bm, name, loc, rot=(0,0,0), m=m, smooth=True)

def plane(sx, sy, loc=(0,0,0), rot=(0,0,0), m=None, name="pl"):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    bmesh.ops.scale(bm, vec=(sx,sy,1), verts=bm.verts)
    return _bmesh_to_obj(bm, name, loc, rot, m)

def _mw(o):
    """Exact local matrix - depsgraph-independent."""
    return Matrix.LocRotScale(o.location, Euler(o.rotation_euler), o.scale)

def merge(objs, name, m=None):
    """Merge objects into one mesh, preserving transforms AND material slots."""
    bm = bmesh.new(); mats = []
    for o in objs:
        om = list(o.data.materials) or [None]
        remap = []
        for mm in om:
            if mm not in mats: mats.append(mm)
            remap.append(mats.index(mm))
        tmp = o.data.copy()
        tmp.transform(_mw(o))
        before = len(bm.faces)
        bm.from_mesh(tmp)
        bm.faces.ensure_lookup_table()
        for f in bm.faces[before:]:
            f.material_index = remap[min(f.material_index, len(remap)-1)]
        bpy.data.meshes.remove(tmp)
        bpy.data.objects.remove(o, do_unlink=True)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for mm in mats:
        if mm: me.materials.append(mm)
    o = bpy.data.objects.new(name, me); link(o)
    return o

# ---------------------------------------------------------------- wheel (shared data -> instanced)
def wheel_data(rad=0.95):
    p=[]
    p.append(cyl(rad,0.30,v=36,m=M_WOODL)); p.append(cyl(rad*0.93,0.34,v=36,m=M_WOOD))
    p.append(cyl(rad*1.015,0.18,v=36,m=M_IRON))
    for i in range(12):
        a=i*pi/6
        p.append(box((rad*0.84,0.10,0.14),(cos(a)*rad*0.44,sin(a)*rad*0.44,0),(0,0,a),m=M_WOOD))
    p.append(cyl(0.27,0.42,v=14,m=M_GOLD)); p.append(cyl(0.12,0.50,v=10,m=M_IRON))
    w = merge(p,"wheelsrc")
    me = w.data.copy()
    me.transform(Matrix.Rotation(pi/2, 4, 'X'))
    bpy.data.objects.remove(w, do_unlink=True)
    return me
WHEEL = wheel_data()

# ---------------------------------------------------------------- deity
def deity(kind, loc, h, tag):
    fc={"jag":BLACK,"bal":(0.90,0.88,0.82),"sub":(0.93,0.70,0.08)}[kind]
    rc={"jag":(0.68,0.09,0.08),"bal":(0.09,0.24,0.58),"sub":(0.78,0.36,0.04)}[kind]
    Mf=mat(f"df{kind}{tag}",fc,0.40); Mr=mat(f"dr{kind}{tag}",rc,0.80)
    Mw=mat("dwhite",(0.97,0.96,0.93),0.28); Mb=mat("dblack",(0.015,0.015,0.02),0.28)
    Mm=mat("dmouth",(0.70,0.09,0.09),0.42)
    p=[]
    p.append(lathe([(h*0.44,0),(h*0.40,h*0.26),(h*0.33,h*0.50),(h*0.30,h*0.62)],
                   28,f"body{tag}{kind}",True,Mr,(loc[0],loc[1],loc[2])))
    hz=loc[2]+h*0.62+h*0.22
    hd=sph(h*0.30,(loc[0],loc[1],hz),seg=22,m=Mf); hd.scale=(1.42,0.80,0.95)
    p.append(hd)
    p.append(cone(h*0.26,h*0.07,h*0.22,(loc[0],loc[1],hz+h*0.30),v=16,m=Mw))
    if kind!="sub":
        for s in(-1,1):
            p.append(cyl(h*0.072,h*0.50,(loc[0]+s*h*0.40,loc[1],loc[2]+h*0.66),(0,pi/2,0),v=10,m=Mf))
    fy=loc[1]-h*0.215
    for s in(-1,1):
        p.append(cyl(h*0.135,h*0.03,(loc[0]+s*h*0.175,fy,hz+h*0.04),(pi/2,0,0),v=22,m=Mw))
        p.append(cyl(h*0.068,h*0.04,(loc[0]+s*h*0.175,fy-h*0.012,hz+h*0.04),(pi/2,0,0),v=18,m=Mb))
    p.append(cyl(h*0.055,h*0.03,(loc[0],fy,hz-h*0.13),(pi/2,0,0),v=14,m=Mm))
    return p

# ---------------------------------------------------------------- horse
def horse(loc, s, col, tag):
    Mh=mat(f"hs{tag}",col,0.60); Mt=mat("htack",(0.62,0.09,0.07),0.72)
    p=[]; bz=1.05*s
    b=sph(0.52*s,(loc[0],loc[1],loc[2]+bz),seg=16,m=Mh); b.scale=(0.78,1.5,0.85); p.append(b)
    p.append(cyl(0.19*s,1.0*s,(loc[0],loc[1]-0.60*s,loc[2]+bz+0.42*s),(R(42),0,0),v=10,m=Mh))
    hd=sph(0.26*s,(loc[0],loc[1]-0.96*s,loc[2]+bz+0.80*s),seg=14,m=Mh); hd.scale=(0.7,1.25,0.78); p.append(hd)
    for sx in(-1,1):
        for sy in(-1,1):
            p.append(cyl(0.085*s,bz,(loc[0]+sx*0.26*s,loc[1]+sy*0.52*s,loc[2]+bz*0.5),v=8,m=Mh))
    p.append(cyl(0.07*s,0.6*s,(loc[0],loc[1]+0.80*s,loc[2]+bz+0.26*s),(R(-50),0,0),v=8,m=Mh))
    p.append(box((0.60*s,0.48*s,0.24*s),(loc[0],loc[1]-0.1*s,loc[2]+bz+0.40*s),m=Mt))
    return p

# ---------------------------------------------------------------- chariot
def chariot(loc, rot, c1, c2, nw, s, tag):
    P=[]; W=[]; P_LIGHT=[]
    Mcan=striped(f"can{tag}",c1,c2,24); Mskt=striped(f"skt{tag}",c2,c1,20,0.9)
    Mpan=mat(f"pan{tag}",c1,0.66)
    per=nw//2
    ys=[(-1+2*i/(per-1))*4.8*s for i in range(per)]
    for sx in(-1,1):
        for yy in ys:
            o=bpy.data.objects.new(f"w{tag}",WHEEL); link(o)
            o.location=(sx*4.45*s,yy,0.95*s); o.scale=(s,s,s); W.append(o)
    for yy in ys: P.append(cyl(0.14*s,9.2*s,(0,yy,0.95*s),(0,pi/2,0),v=10,m=M_IRON))
    # platform + draped skirt
    P.append(box((9.9*s,10.8*s,0.50*s),(0,0,2.18*s),m=M_WOOD))
    P.append(box((10.4*s,11.3*s,0.22*s),(0,0,2.50*s),m=M_GOLD))
    P.append(lathe([(5.5*s,1.05*s),(5.35*s,1.9*s),(5.0*s,2.45*s)],40,f"skirt{tag}",False,Mskt,loc=(0,0,0)))
    # pillared chamber (front open)
    pz=2.75*s; ph=4.25*s
    for sx in(-1,1):
        for sy in(-1,1):
            P.append(cyl(0.30*s,ph,(sx*3.95*s,sy*3.95*s,pz+ph/2),v=12,m=M_GOLD))
    P.append(box((8.7*s,0.26*s,ph*0.92),(0,4.0*s,pz+ph/2),m=Mpan))
    for sx in(-1,1):
        P.append(box((0.26*s,8.1*s,ph*0.92),(sx*4.0*s,0,pz+ph/2),m=Mpan))
    for zz in (pz+0.16*s, pz+ph-0.16*s):
        P.append(box((8.9*s,8.9*s,0.28*s),(0,0,zz),m=M_GOLD))
    P.append(box((9.5*s,9.3*s,0.40*s),(0,0,pz+ph+0.20*s),m=M_WOODL))
    P.append(lathe([(5.1*s,pz+ph+0.38*s),(4.6*s,pz+ph+0.95*s)],36,f"cor{tag}",False,M_GOLD))
    # canopy : slender concave lathe
    cz=pz+ph+0.95*s; ch=9.3*s; CR=4.55*s
    prof=[]
    for i in range(13):
        t=i/12.0
        prof.append((CR*(1-t)**1.22 + 0.22*s, cz + t*ch))
    P.append(lathe(prof,56,f"canopy{tag}",True,Mcan))
    P.append(lathe([(CR*1.03,cz),(CR*1.05,cz+0.34*s),(CR*0.99,cz+0.52*s)],48,f"band{tag}",False,M_GOLD))
    kz=cz+ch
    P.append(sph(0.60*s,(0,0,kz+0.30*s),seg=16,m=M_GOLD))
    P.append(cone(0.44*s,0.04*s,0.95*s,(0,0,kz+1.08*s),v=14,m=M_GOLD))
    P.append(cyl(0.085*s,3.8*s,(0,0,kz+3.1*s),v=8,m=M_WOOD))
    P.append(box((0.04*s,2.4*s,1.3*s),(0,1.25*s,kz+4.35*s),m=mat(f"flag{tag}",(0.80,0.08,0.06),0.86)))
    # deities
    P+=deity("bal",(-2.45*s,1.2*s,pz+0.08*s),3.35*s,tag)
    P+=deity("sub",( 0.00*s,1.4*s,pz+0.08*s),2.70*s,tag)
    P+=deity("jag",( 2.45*s,1.2*s,pz+0.08*s),3.35*s,tag)
    # horses
    for i,hx in enumerate((-3.1,-1.05,1.05,3.1)):
        P+=horse((hx*s,-7.8*s-abs(hx)*0.22*s,0),s,(0.92,0.90,0.86) if i%2==0 else (0.84,0.76,0.68),f"{tag}{i}")
    P.append(box((7.2*s,0.30*s,0.30*s),(0,-6.3*s,1.95*s),m=M_WOOD))
    body=merge(P,f"rath{tag}")
    kd=bpy.data.lights.new(f"key{tag}",type='POINT')
    kd.energy=float(arg('dlight',2600))*s*s; kd.color=(1.0,0.66,0.36); kd.shadow_soft_size=2.5
    try: kd.use_shadow=False
    except Exception: pass
    ko=bpy.data.objects.new(f"key{tag}",kd); link(ko); ko.location=(0,-6.5*s,6.2*s)
    P_LIGHT.append(ko)
    emp=bpy.data.objects.new(f"R{tag}",None); link(emp)
    emp.location=loc; emp.rotation_euler=(0,0,rot)
    body.parent=emp
    for w in W: w.parent=emp
    for l in P_LIGHT: l.parent=emp
    return emp

CH=[((0,0,0),R(7),YELLOW,RED,16,1.00,"A"),
    ((-6,64,0),R(-5),GREEN,RED,14,0.95,"B"),
    ((-14,130,0),R(3),BLACK,RED,12,0.90,"C")]
for c in CH: chariot(*c)
FOOT=[(c[0][0],c[0][1],14*c[5]) for c in CH]

# ---------------------------------------------------------------- temple (rekha deula, far)
def temple(loc, H=62):
    Mt=mat("temple",(0.33,0.28,0.25),0.88)
    prof=[]
    for i in range(22):
        t=i/21.0
        r=(0.175*H)*(1.0-0.80*t**2.2)**0.45
        prof.append((max(r,0.004*H), t*H*0.82))
    lathe(prof,28,"deula",True,Mt,loc=loc)
    lathe([(0.084*H,H*0.82),(0.112*H,H*0.846),(0.104*H,H*0.872),(0.052*H,H*0.896)],28,"amalaka",True,Mt,loc=loc)
    cone(0.040*H,0.010*H,0.095*H,(loc[0],loc[1],loc[2]+H*0.925),v=12,m=M_GOLD)
    # jagamohana (pyramidal front hall)
    lathe([(0.26*H,0),(0.22*H,0.17*H),(0.15*H,0.31*H),(0.05*H,0.40*H)],4,"jaga",False,Mt,
          loc=(loc[0],loc[1]-0.30*H,loc[2]),rot=(0,0,R(45)))
temple((float(arg('tx',-40)),float(arg('ty',330)),0),62)

# ---------------------------------------------------------------- ground / sea
SHORE_X = float(arg("shore",-78.0))
sand=bpy.data.materials.new("sand"); sand.use_nodes=True
nt=sand.node_tree; b=nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value=0.93
n=nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value=70; n.inputs["Detail"].default_value=9
rr=nt.nodes.new("ShaderNodeValToRGB")
rr.color_ramp.elements[0].color=(0.325,0.250,0.168,1)
rr.color_ramp.elements[1].color=(0.560,0.448,0.318,1)
nt.links.new(n.outputs["Fac"],rr.inputs["Fac"]); nt.links.new(rr.outputs["Color"],b.inputs["Base Color"])
bm_=nt.nodes.new("ShaderNodeBump"); bm_.inputs["Strength"].default_value=0.22
nt.links.new(n.outputs["Fac"],bm_.inputs["Height"]); nt.links.new(bm_.outputs["Normal"],b.inputs["Normal"])
plane(900,1400,(140,250,0),m=sand,name="sand")
plane(26,1400,(SHORE_X+9,250,0.015),m=mat("wet",(0.175,0.135,0.098),0.14),name="wet")

sea=bpy.data.materials.new("sea"); sea.use_nodes=True
nt=sea.node_tree; b=nt.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value=(0.018,0.062,0.090,1)
b.inputs["Roughness"].default_value=0.045; b.inputs["IOR"].default_value=1.333
n2=nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value=22
n2.inputs["Detail"].default_value=10; n2.inputs["Roughness"].default_value=0.6
b2=nt.nodes.new("ShaderNodeBump"); b2.inputs["Strength"].default_value=0.26; b2.inputs["Distance"].default_value=0.11
nt.links.new(n2.outputs["Fac"],b2.inputs["Height"]); nt.links.new(b2.outputs["Normal"],b.inputs["Normal"])
plane(4000,4000,(SHORE_X-1900,300,-0.06),m=sea,name="sea")
Mfoam=mat("foam",(0.90,0.90,0.88),0.50)
for i,(xx,w) in enumerate([(SHORE_X-1.5,3.4),(SHORE_X-12,2.3),(SHORE_X-29,1.7)]):
    plane(w,1300,(xx,250+i*30,0.035+i*0.012),m=Mfoam,name=f"foam{i}")

# ---------------------------------------------------------------- palms
def palm(loc,h,lean,rot,tag):
    Mt=mat(f"pt{tag%4}",(0.27,0.20,0.14),0.86); Mf=mat(f"pf{tag%4}",(0.075,0.22,0.075),0.70)
    p=[cone(0.40,0.19,h,(0,0,h/2),v=9,m=Mt)]
    for i in range(10):
        a=i*2*pi/10
        fr=cone(0.60,0.02,4.6,(cos(a)*2.0,sin(a)*2.0,h+0.2),(R(64),0,a),v=4,m=Mf)
        fr.scale=(1,0.10,1); p.append(fr)
    o=merge(p,f"palm{tag}"); o.location=loc
    o.rotation_euler=(lean*cos(rot),lean*sin(rot),rot); return o
for i in range(18):
    palm((random.uniform(SHORE_X-6,SHORE_X+16) if i%3 else random.uniform(70,150),
          random.uniform(-40,330),0), random.uniform(8,13),
         R(random.uniform(5,13)), random.uniform(0,2*pi), i)

# ---------------------------------------------------------------- crowd
def person_data(col,raised,idx):
    Mc=mat(f"pc{idx}",col,0.80); Ms=mat("skin",(0.26,0.155,0.085),0.72)
    p=[cone(0.215,0.135,0.95,(0,0,0.475),v=9,m=Mc), cyl(0.135,0.46,(0,0,1.17),v=9,m=Mc),
       sph(0.125,(0,0,1.50),seg=10,m=Ms)]
    if raised:
        for s in(-1,1): p.append(cyl(0.050,0.62,(s*0.20,0,1.54),(0,s*R(20),0),v=6,m=Ms))
    else:
        for s in(-1,1): p.append(cyl(0.050,0.52,(s*0.175,0,1.12),(0,s*R(8),0),v=6,m=Ms))
    o=merge(p,f"pp{idx}"); me=o.data.copy()
    bpy.data.objects.remove(o,do_unlink=True); return me

CC=[(0.90,0.88,0.84),(0.86,0.83,0.76),(0.93,0.90,0.85),(0.88,0.85,0.79),
    (0.88,0.40,0.05),(0.94,0.56,0.06),(0.80,0.20,0.05),(0.62,0.07,0.06),
    (0.92,0.72,0.10),(0.86,0.82,0.70),(0.55,0.14,0.26),(0.12,0.30,0.46)]
PEOPLE=[]
for i,c in enumerate(CC):
    PEOPLE.append(person_data(c,False,i)); PEOPLE.append(person_data(c,True,i+50))

def blocked(x,y):
    for cx,cy,r in FOOT:
        if (x-cx)**2+(y-cy)**2 < r*r: return True
    return x < SHORE_X+3

cp=bpy.data.objects.new("crowd",None); link(cp)
placed=0; tries=0
while placed<NCROWD and tries<NCROWD*12:
    tries+=1; q=random.random()
    if q<0.46:
        cx,cy,r=FOOT[random.choices([0,1,2],[0.46,0.30,0.24])[0]]
        a=random.uniform(0,2*pi); d=r+abs(random.gauss(0,8.5))+1.0
        x,y=cx+cos(a)*d, cy+sin(a)*d
    elif q<0.74:
        t=random.random()
        x=random.gauss(0,6.0)+(-1 if random.random()<0.5 else 1)*3.4
        y=-10-t*48+random.gauss(0,2.6)
    else:
        x=random.gauss(6,38); y=random.uniform(-62,210)
    if not(SHORE_X+3<x<150) or not(-66<y<260): continue
    if blocked(x,y): continue
    o=bpy.data.objects.new("p",random.choice(PEOPLE)); link(o)
    o.location=(x,y,0); o.rotation_euler=(0,0,random.uniform(0,2*pi))
    sc=random.uniform(0.90,1.10); o.scale=(sc,sc,sc*random.uniform(0.95,1.06))
    o.parent=cp; placed+=1
# foreground depth layer (close to camera -> bokeh)
for i in range(26):
    o=bpy.data.objects.new("fg",random.choice(PEOPLE)); link(o)
    o.location=(random.uniform(4,22),random.uniform(-46,-30),0)
    o.rotation_euler=(0,0,random.uniform(0,2*pi))
    sc=random.uniform(0.95,1.12); o.scale=(sc,sc,sc); o.parent=cp
print("CROWD",placed)

# ---------------------------------------------------------------- ropes + banners
Mrope=mat("rope",(0.50,0.38,0.22),0.90)
for ci,(cloc,crot,_,_,_,cs,ctag) in enumerate(CH[:2]):
    for sx in(-1,1):
        cd=bpy.data.curves.new(f"rp{ctag}{sx}",'CURVE'); cd.dimensions='3D'
        sp=cd.splines.new('POLY'); nn=16; sp.points.add(nn-1)
        for i in range(nn):
            t=i/(nn-1)
            lx=sx*(2.7+t*1.9)*cs; ly=(-8.8-t*52)*cs
            gx=cloc[0]+lx*cos(crot)-ly*sin(crot)
            gy=cloc[1]+lx*sin(crot)+ly*cos(crot)
            sp.points[i].co=(gx, gy, (3.0-t*1.85+sin(t*pi)*0.40)*cs, 1)
        cd.bevel_depth=0.085; cd.bevel_resolution=2
        ro=bpy.data.objects.new(f"rp{ctag}{sx}",cd); link(ro); ro.data.materials.append(Mrope)
BAN=[(0.82,0.10,0.05),(0.93,0.63,0.03),(0.92,0.90,0.86),(0.78,0.30,0.02),(0.10,0.32,0.55)]
for i in range(90):
    x=random.gauss(6,30); y=random.uniform(-56,190)
    if blocked(x,y) or x<SHORE_X+3: continue
    hh=random.uniform(2.8,4.8)
    cyl(0.035,hh,(x,y,hh/2),v=6,m=M_WOOD,name="bp")
    box((0.03,0.9,0.55),(x,y+0.45,hh-0.32),(0,0,random.uniform(0,pi)),
        m=mat(f"bn{i%5}",BAN[i%5],0.86),name="bf")

# ---------------------------------------------------------------- birds
Mbird=mat("bird",(0.05,0.045,0.05),0.9)
for i in range(26):
    bx=random.uniform(-180,90); by=random.uniform(60,420); bz=random.uniform(28,78)
    sc_=random.uniform(0.5,1.3)
    for w in(-1,1):
        b_=box((2.6*sc_,0.5*sc_,0.09*sc_),(bx+w*1.25*sc_,by,bz),
               (0,R(random.uniform(8,26))*w,R(random.uniform(-20,20))),m=Mbird,name="bird")

# ---------------------------------------------------------------- world
world=bpy.data.worlds.new("W"); SC.world=world; world.use_nodes=True
wnt=world.node_tree; wnt.nodes.clear()
wo=wnt.nodes.new("ShaderNodeOutputWorld"); wb=wnt.nodes.new("ShaderNodeBackground")
sky=wnt.nodes.new("ShaderNodeTexSky")
sky.sky_type='MULTIPLE_SCATTERING'
sky.sun_elevation=R(SUN_ELEV); sky.sun_rotation=R(SUN_ROT)
sky.sun_intensity=float(arg('sunint',1.3)); sky.sun_size=R(float(arg('sunsize',2.0))); sky.sun_disc=True
sky.altitude=15; sky.air_density=float(arg('air',1.05))
sky.aerosol_density=float(arg('aero',1.9)); sky.ozone_density=1.0
# --- procedural clouds, evaluated in the world shader (no volume cost)
A_SUN=R(SUN_ROT-8.0)                       # measured convention
SUNV=(sin(A_SUN)*cos(R(SUN_ELEV)), cos(A_SUN)*cos(R(SUN_ELEV)), sin(R(SUN_ELEV)))
if arg('clouds','1')=='1':
    tc=wnt.nodes.new("ShaderNodeTexCoord")
    sep=wnt.nodes.new("ShaderNodeSeparateXYZ")
    wnt.links.new(tc.outputs["Generated"],sep.inputs["Vector"])
    zc=wnt.nodes.new("ShaderNodeMath"); zc.operation='MAXIMUM'; zc.inputs[1].default_value=0.045
    wnt.links.new(sep.outputs["Z"],zc.inputs[0])
    du=wnt.nodes.new("ShaderNodeMath"); du.operation='DIVIDE'
    wnt.links.new(sep.outputs["X"],du.inputs[0]); wnt.links.new(zc.outputs[0],du.inputs[1])
    dv=wnt.nodes.new("ShaderNodeMath"); dv.operation='DIVIDE'
    wnt.links.new(sep.outputs["Y"],dv.inputs[0]); wnt.links.new(zc.outputs[0],dv.inputs[1])
    cmb=wnt.nodes.new("ShaderNodeCombineXYZ")
    wnt.links.new(du.outputs[0],cmb.inputs["X"]); wnt.links.new(dv.outputs[0],cmb.inputs["Y"])
    mp=wnt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value=(float(arg('csx',0.30)),float(arg('csx',0.30)),1)
    wnt.links.new(cmb.outputs[0],mp.inputs["Vector"])
    nz=wnt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value=float(arg('cscale',1.5))
    nz.inputs["Detail"].default_value=11.0; nz.inputs["Roughness"].default_value=0.56
    wnt.links.new(mp.outputs["Vector"],nz.inputs["Vector"])
    rp=wnt.nodes.new("ShaderNodeValToRGB")
    rp.color_ramp.elements[0].position=float(arg('ccov',0.44))
    rp.color_ramp.elements[1].position=float(arg('ccov2',0.60))
    wnt.links.new(nz.outputs["Fac"],rp.inputs["Fac"])
    # fade clouds out at the horizon
    fade=wnt.nodes.new("ShaderNodeMapRange"); fade.interpolation_type='SMOOTHSTEP'
    fade.inputs["From Min"].default_value=0.012; fade.inputs["From Max"].default_value=0.16
    wnt.links.new(sep.outputs["Z"],fade.inputs["Value"])
    fac=wnt.nodes.new("ShaderNodeMath"); fac.operation='MULTIPLY'
    wnt.links.new(rp.outputs["Color"],fac.inputs[0]); wnt.links.new(fade.outputs[0],fac.inputs[1])
    # cloud colour: warm where it faces the sun, cool away from it
    nrm=wnt.nodes.new("ShaderNodeVectorMath"); nrm.operation='NORMALIZE'
    wnt.links.new(tc.outputs["Generated"],nrm.inputs[0])
    dp=wnt.nodes.new("ShaderNodeVectorMath"); dp.operation='DOT_PRODUCT'
    dp.inputs[1].default_value=SUNV
    wnt.links.new(nrm.outputs["Vector"],dp.inputs[0])
    dr=wnt.nodes.new("ShaderNodeMapRange")
    dr.inputs["From Min"].default_value=0.25; dr.inputs["From Max"].default_value=0.97
    wnt.links.new(dp.outputs["Value"],dr.inputs["Value"])
    ccol=wnt.nodes.new("ShaderNodeMixRGB")
    ccol.inputs["Color1"].default_value=(0.60,0.57,0.60,1)      # shadowed cloud
    ccol.inputs["Color2"].default_value=(1.00,0.90,0.70,1)      # sunlit edge
    wnt.links.new(dr.outputs[0],ccol.inputs["Fac"])
    mix=wnt.nodes.new("ShaderNodeMixRGB")
    wnt.links.new(fac.outputs[0],mix.inputs["Fac"])
    wnt.links.new(sky.outputs[0],mix.inputs["Color1"])
    wnt.links.new(ccol.outputs[0],mix.inputs["Color2"])
    wnt.links.new(mix.outputs[0],wb.inputs["Color"])
else:
    wnt.links.new(sky.outputs[0],wb.inputs["Color"])
AMB=float(arg('amb',0.06))
lp=wnt.nodes.new("ShaderNodeLightPath")
m1=wnt.nodes.new("ShaderNodeMath"); m1.operation='MULTIPLY'; m1.inputs[1].default_value=1.0-AMB
m2=wnt.nodes.new("ShaderNodeMath"); m2.operation='ADD';      m2.inputs[1].default_value=AMB
wnt.links.new(lp.outputs['Is Camera Ray'],m1.inputs[0])
wnt.links.new(m1.outputs[0],m2.inputs[0])
wnt.links.new(m2.outputs[0],wb.inputs["Strength"])
wnt.links.new(wb.outputs[0],wo.inputs["Surface"])

sd=bpy.data.lights.new("sun",type='SUN'); sd.energy=float(arg('sune',9.0)); sd.angle=R(2.2)
sd.color=(1.0,0.56,0.26)
so=bpy.data.objects.new("sun",sd); link(so)
so.rotation_euler=(R(90-SUN_ELEV),0,R(188-SUN_ROT))   # measured: sky az = sun_rotation-8, from +Y toward +X
fd=bpy.data.lights.new("fill",type='SUN'); fd.energy=0.35; fd.angle=R(50)
fd.color=(0.38,0.55,0.95)
fo=bpy.data.objects.new("fill",fd); link(fo); fo.rotation_euler=(R(52),0,R(150))
bd=bpy.data.lights.new("bounce",type='SUN'); bd.energy=float(arg('bnc',0.85)); bd.angle=R(60)
bd.color=(1.0,0.74,0.48)
bo=bpy.data.objects.new("bounce",bd); link(bo)
bo.rotation_euler=(R(118),0,R(188-SUN_ROT))   # from below-front, mimics hot sand bounce

if USE_VOL:
    vm=bpy.data.materials.new("haze"); vm.use_nodes=True
    v_nt=vm.node_tree; v_nt.nodes.clear()
    vo=v_nt.nodes.new("ShaderNodeOutputMaterial")
    pv=v_nt.nodes.new("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value=(1.0,0.82,0.62,1)
    pv.inputs["Density"].default_value=0.0016
    pv.inputs["Anisotropy"].default_value=0.62
    v_nt.links.new(pv.outputs[0],vo.inputs["Volume"])
    vb=box((1600,1600,90),(0,200,42),m=vm,name="haze")

# ---------------------------------------------------------------- camera + render
cd_=bpy.data.cameras.new("cam"); cd_.lens=LENS; cd_.sensor_fit='VERTICAL'; cd_.sensor_height=36
cam=bpy.data.objects.new("cam",cd_); link(cam); cam.location=CAM
tgt=bpy.data.objects.new("tgt",None); link(tgt); tgt.location=TGT
c=cam.constraints.new('TRACK_TO'); c.target=tgt; c.track_axis='TRACK_NEGATIVE_Z'; c.up_axis='UP_Y'
SC.camera=cam
cd_.dof.use_dof=True; cd_.dof.focus_object=tgt; cd_.dof.aperture_fstop=2.8

SC.render.engine='CYCLES'; SC.cycles.device='CPU'
SC.cycles.samples=SAMPLES; SC.cycles.use_denoising=True
SC.cycles.max_bounces=5; SC.cycles.diffuse_bounces=3; SC.cycles.glossy_bounces=3
SC.cycles.transmission_bounces=2; SC.cycles.volume_bounces=1
SC.cycles.use_fast_gi=False

SC.render.resolution_x=RES_X; SC.render.resolution_y=RES_Y
SC.render.filepath=OUT
try:
    SC.view_settings.view_transform='AgX'
    for lk in ('AgX - Punchy','Punchy','AgX - High Contrast','AgX - Medium High Contrast'):
        try: SC.view_settings.look=lk; break
        except Exception: pass
except Exception:
    SC.view_settings.view_transform='Filmic'
SC.view_settings.exposure=float(arg('exp',0.0))

t0=time.time(); bpy.ops.render.render(write_still=True)
print("RENDER_SECONDS",round(time.time()-t0,1),"OBJECTS",len(bpy.data.objects))
